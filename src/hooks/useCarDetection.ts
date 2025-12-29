import { useEffect, useRef, useState } from "react";
import { env, pipeline } from "@huggingface/transformers";

// Ensure models are downloaded remotely (no local files)
env.allowLocalModels = false;
env.useBrowserCache = true;

type RawDetection = {
  score: number;
  label: string;
  box: { xmin: number; ymin: number; xmax: number; ymax: number };
};

type NormCarDet = {
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CarDetection = {
  id: string;
  trackingId: number;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type TrackState = {
  id: string;
  trackingId: number;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  hits: number;
  misses: number;
  lastSeenAt: number;
};

// Only detect "car" class - ignore everything else
const CAR_LABELS = new Set(["car"]);

// Detection settings
const DEFAULT_CONFIDENCE = 0.88;
const DEFAULT_INTERVAL_MS = 350;

// Car box validation (normalized 0-1)
const CAR_BOX = {
  aspectRatio: { min: 1.0, max: 4.5 },
  area: { min: 0.001, max: 0.25 },
  width: { min: 0.02, max: 0.7 },
  height: { min: 0.015, max: 0.45 },
};

// Tracking settings (no motion/optical-flow, pure object tracking)
const TRACK = {
  matchIou: 0.25,
  nmsIou: 0.35,
  minHits: 2,
  maxMisses: 5,
  smoothAlpha: 0.3,
  stableMaxMisses: 2,
};

// Road ROI - lower horizon values = more of frame is considered road
// This ensures boxes appear on actual road area where cars drive
type RoadConfig = {
  horizonY: number; // Top of road region (0 = top of frame, 1 = bottom)
  minY: number; // Minimum Y for valid detection
};

const ROAD_CONFIGS: Record<string, RoadConfig> = {
  "CAM-LONDON-001": { horizonY: 0.25, minY: 0.20 },
  "CAM-CANADA-002": { horizonY: 0.30, minY: 0.25 },
  "CAM-NYC-003": { horizonY: 0.35, minY: 0.30 },
  "CAM-INT-004": { horizonY: 0.25, minY: 0.20 },
};

const DEFAULT_ROAD: RoadConfig = { horizonY: 0.25, minY: 0.20 };

function getRoadConfig(cameraId?: string): RoadConfig {
  if (!cameraId) return DEFAULT_ROAD;
  return ROAD_CONFIGS[cameraId] ?? DEFAULT_ROAD;
}

let detectorPromise: Promise<any> | null = null;
function getDetector() {
  if (!detectorPromise) {
    detectorPromise = pipeline("object-detection", "Xenova/yolos-tiny");
  }
  return detectorPromise;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function iou(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
) {
  const ax1 = a.x, ay1 = a.y, ax2 = a.x + a.width, ay2 = a.y + a.height;
  const bx1 = b.x, by1 = b.y, bx2 = b.x + b.width, by2 = b.y + b.height;

  const ix1 = Math.max(ax1, bx1);
  const iy1 = Math.max(ay1, by1);
  const ix2 = Math.min(ax2, bx2);
  const iy2 = Math.min(ay2, by2);

  const iw = Math.max(0, ix2 - ix1);
  const ih = Math.max(0, iy2 - iy1);
  const inter = iw * ih;
  const union = a.width * a.height + b.width * b.height - inter;
  return union <= 0 ? 0 : inter / union;
}

function nms(dets: NormCarDet[], iouThreshold: number) {
  const sorted = [...dets].sort((a, b) => b.confidence - a.confidence);
  const kept: NormCarDet[] = [];
  for (const d of sorted) {
    if (kept.every((k) => iou(d, k) < iouThreshold)) kept.push(d);
  }
  return kept;
}

function isValidCarBox(det: NormCarDet, roadConfig: RoadConfig) {
  const { x, y, width, height } = det;
  if (width <= 0 || height <= 0) return false;

  const area = width * height;
  const ar = width / height;
  const bottomY = y + height;

  // Basic shape validation
  const shapeOk =
    ar >= CAR_BOX.aspectRatio.min &&
    ar <= CAR_BOX.aspectRatio.max &&
    area >= CAR_BOX.area.min &&
    area <= CAR_BOX.area.max &&
    width >= CAR_BOX.width.min &&
    width <= CAR_BOX.width.max &&
    height >= CAR_BOX.height.min &&
    height <= CAR_BOX.height.max;

  if (!shapeOk) return false;

  // Road grounding: bottom of box must be below horizon (on road)
  // and box center should be in road region
  const centerY = y + height / 2;
  if (centerY < roadConfig.minY) return false;
  if (bottomY < roadConfig.horizonY) return false;

  return true;
}

export function useCarDetection({
  videoRef,
  enabled,
  cameraId,
  confidenceThreshold = DEFAULT_CONFIDENCE,
  intervalMs = DEFAULT_INTERVAL_MS,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled: boolean;
  cameraId?: string;
  confidenceThreshold?: number;
  intervalMs?: number;
}) {
  const [cars, setCars] = useState<CarDetection[]>([]);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tracksRef = useRef<Map<number, TrackState>>(new Map());
  const nextTrackIdRef = useRef(1);

  useEffect(() => {
    let cancelled = false;
    setIsModelLoading(true);

    getDetector()
      .then(() => {
        if (cancelled) return;
        setIsModelLoading(false);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load detection model");
        setIsModelLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setCars([]);
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    const tick = async () => {
      try {
        const video = videoRef.current;
        if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
          timer = window.setTimeout(tick, intervalMs);
          return;
        }

        const detector = await getDetector();
        const roadConfig = getRoadConfig(cameraId);

        // Downscale for speed
        const targetW = Math.min(640, video.videoWidth);
        const scale = targetW / video.videoWidth;
        const targetH = Math.round(video.videoHeight * scale);

        if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
        const canvas = canvasRef.current;
        canvas.width = targetW;
        canvas.height = targetH;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          timer = window.setTimeout(tick, intervalMs);
          return;
        }

        ctx.drawImage(video, 0, 0, targetW, targetH);

        const raw = (await detector(canvas, {
          threshold: confidenceThreshold,
        })) as RawDetection[];

        // Filter: car class only
        const carDets: NormCarDet[] = raw
          .filter((r) => CAR_LABELS.has(String(r.label).toLowerCase()))
          .map((r) => {
            const xmin = clamp(r.box.xmin, 0, targetW);
            const ymin = clamp(r.box.ymin, 0, targetH);
            const xmax = clamp(r.box.xmax, 0, targetW);
            const ymax = clamp(r.box.ymax, 0, targetH);

            return {
              confidence: r.score,
              x: xmin / targetW,
              y: ymin / targetH,
              width: (xmax - xmin) / targetW,
              height: (ymax - ymin) / targetH,
            };
          })
          .filter((d) => d.confidence >= confidenceThreshold)
          .filter((d) => isValidCarBox(d, roadConfig));

        // NMS to remove duplicates
        const deduped = nms(carDets, TRACK.nmsIou);

        // Tracking for stable boxes
        const now = Date.now();
        const tracks = tracksRef.current;

        for (const t of tracks.values()) t.misses += 1;

        const matchedTrackIds = new Set<number>();
        for (const det of deduped) {
          let bestId: number | null = null;
          let bestIoU = 0;

          for (const [id, tr] of tracks.entries()) {
            if (matchedTrackIds.has(id)) continue;
            const score = iou(det, tr);
            if (score > bestIoU) {
              bestIoU = score;
              bestId = id;
            }
          }

          if (bestId !== null && bestIoU >= TRACK.matchIou) {
            matchedTrackIds.add(bestId);
            const tr = tracks.get(bestId)!;
            const a = TRACK.smoothAlpha;

            tracks.set(bestId, {
              ...tr,
              x: tr.x + a * (det.x - tr.x),
              y: tr.y + a * (det.y - tr.y),
              width: tr.width + a * (det.width - tr.width),
              height: tr.height + a * (det.height - tr.height),
              confidence: det.confidence,
              hits: tr.hits + 1,
              misses: 0,
              lastSeenAt: now,
            });
          } else {
            const id = nextTrackIdRef.current++;
            tracks.set(id, {
              id: `car-${id}`,
              trackingId: id,
              confidence: det.confidence,
              x: det.x,
              y: det.y,
              width: det.width,
              height: det.height,
              hits: 1,
              misses: 0,
              lastSeenAt: now,
            });
          }
        }

        // Prune stale tracks
        for (const [id, tr] of tracks.entries()) {
          if (tr.misses > TRACK.maxMisses) tracks.delete(id);
        }

        // Emit stable tracks only
        const stable = [...tracks.values()]
          .filter((t) => t.hits >= TRACK.minHits)
          .filter((t) => t.misses <= TRACK.stableMaxMisses)
          .map((t) => ({
            id: t.id,
            trackingId: t.trackingId,
            confidence: t.confidence,
            x: t.x * 100,
            y: t.y * 100,
            width: t.width * 100,
            height: t.height * 100,
          }));

        if (!cancelled) setCars(stable);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Detection failed");
      } finally {
        if (!cancelled) timer = window.setTimeout(tick, intervalMs);
      }
    };

    tick();

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [enabled, intervalMs, confidenceThreshold, videoRef, cameraId]);

  return { cars, isModelLoading, error };
}
