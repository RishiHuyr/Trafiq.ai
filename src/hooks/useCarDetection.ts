import { useEffect, useRef, useState } from "react";
import { env, pipeline } from "@huggingface/transformers";

// Ensure models are downloaded remotely (no local files)
env.allowLocalModels = false;
// Cache model assets for faster subsequent loads
env.useBrowserCache = true;

type RawDetection = {
  score: number;
  label: string;
  box: { xmin: number; ymin: number; xmax: number; ymax: number };
};

export type CarDetection = {
  id: string;
  trackingId: number;
  confidence: number;
  // Percent-based box for easy rendering over responsive video
  x: number;
  y: number;
  width: number;
  height: number;
};

type TrackState = CarDetection & {
  hits: number;
  misses: number;
  lastSeenAt: number;
};

const CAR_LABELS = new Set(["car", "automobile"]);

// High-confidence car-only defaults
const DEFAULT_CONFIDENCE = 0.92;
const DEFAULT_INTERVAL_MS = 350;

// Validation tuned for typical traffic footage (relative to frame)
const CAR_BOX = {
  aspectRatio: { min: 1.1, max: 4.8 },
  area: { min: 0.0025, max: 0.18 }, // 0.25% .. 18% of frame
  width: { min: 0.03, max: 0.55 },
  height: { min: 0.02, max: 0.35 },
};

// Tracking / stabilization
const TRACK = {
  matchIou: 0.25,
  nmsIou: 0.45,
  minHits: 3,
  maxMisses: 4,
  smoothAlpha: 0.35,
};

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

function iou(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) {
  const ax1 = a.x;
  const ay1 = a.y;
  const ax2 = a.x + a.width;
  const ay2 = a.y + a.height;

  const bx1 = b.x;
  const by1 = b.y;
  const bx2 = b.x + b.width;
  const by2 = b.y + b.height;

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

function nms(dets: CarDetection[], iouThreshold: number) {
  const sorted = [...dets].sort((a, b) => b.confidence - a.confidence);
  const kept: CarDetection[] = [];

  for (const d of sorted) {
    if (kept.every((k) => iou(d, k) < iouThreshold)) kept.push(d);
  }
  return kept;
}

function isValidCarBox(det: CarDetection) {
  const w = det.width;
  const h = det.height;
  if (w <= 0 || h <= 0) return false;

  const area = w * h;
  const ar = w / h;

  return (
    ar >= CAR_BOX.aspectRatio.min &&
    ar <= CAR_BOX.aspectRatio.max &&
    area >= CAR_BOX.area.min &&
    area <= CAR_BOX.area.max &&
    w >= CAR_BOX.width.min &&
    w <= CAR_BOX.width.max &&
    h >= CAR_BOX.height.min &&
    h <= CAR_BOX.height.max
  );
}

export function useCarDetection({
  videoRef,
  enabled,
  confidenceThreshold = DEFAULT_CONFIDENCE,
  intervalMs = DEFAULT_INTERVAL_MS,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled: boolean;
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

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

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

        // Prepare canvas (downscale for speed)
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

        // Strict: car class only
        const carDets: CarDetection[] = raw
          .filter((r) => CAR_LABELS.has(String(r.label).toLowerCase()))
          .map((r) => {
            const xmin = clamp(r.box.xmin, 0, targetW);
            const ymin = clamp(r.box.ymin, 0, targetH);
            const xmax = clamp(r.box.xmax, 0, targetW);
            const ymax = clamp(r.box.ymax, 0, targetH);

            const x = xmin / targetW;
            const y = ymin / targetH;
            const width = (xmax - xmin) / targetW;
            const height = (ymax - ymin) / targetH;

            return {
              id: "det", // placeholder
              trackingId: -1,
              confidence: r.score,
              x,
              y,
              width,
              height,
            };
          })
          .filter((d) => d.confidence >= confidenceThreshold)
          .filter(isValidCarBox);

        // Suppress duplicates from model
        const deduped = nms(carDets, TRACK.nmsIou);

        // Tracking for stability
        const now = Date.now();
        const tracks = tracksRef.current;

        // Increment misses for all tracks; we will reset on match
        for (const t of tracks.values()) t.misses += 1;

        // Greedy match detections to tracks by IoU
        for (const det of deduped) {
          let bestId: number | null = null;
          let bestIoU = 0;

          for (const [id, tr] of tracks.entries()) {
            const score = iou(det, tr);
            if (score > bestIoU) {
              bestIoU = score;
              bestId = id;
            }
          }

          if (bestId !== null && bestIoU >= TRACK.matchIou) {
            const tr = tracks.get(bestId)!;
            const a = TRACK.smoothAlpha;
            const nx = tr.x + a * (det.x - tr.x);
            const ny = tr.y + a * (det.y - tr.y);
            const nw = tr.width + a * (det.width - tr.width);
            const nh = tr.height + a * (det.height - tr.height);

            tracks.set(bestId, {
              ...tr,
              x: nx,
              y: ny,
              width: nw,
              height: nh,
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

        // Prune old tracks
        for (const [id, tr] of tracks.entries()) {
          if (tr.misses > TRACK.maxMisses) tracks.delete(id);
        }

        // Emit stable tracks only
        const stable = [...tracks.values()]
          .filter((t) => t.hits >= TRACK.minHits)
          .filter((t) => t.misses <= 1)
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
  }, [enabled, intervalMs, confidenceThreshold, videoRef]);

  return { cars, isModelLoading, error };
}
