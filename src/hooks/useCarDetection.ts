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

type NormCarDet = {
  confidence: number;
  // Normalized [0..1] box for stable math + validation
  x: number;
  y: number;
  width: number;
  height: number;
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

type Point = { x: number; y: number };

type RoadRoi = {
  /** Anything above this (normalized) is treated as non-road/horizon */
  horizonY: number;
  /** Road polygon in normalized coordinates (trapezoid works well for fixed cams) */
  polygon: Point[];
  /** Simple perspective constraints: expected size increases as box bottom gets closer to frame bottom */
  perspective: {
    minHeightAtHorizon: number;
    maxHeightAtHorizon: number;
    minHeightAtBottom: number;
    maxHeightAtBottom: number;
    minWidthAtHorizon: number;
    maxWidthAtBottom: number;
  };
};

const CAR_LABELS = new Set(["car"]);

// High-confidence car-only defaults
const DEFAULT_CONFIDENCE = 0.93;
const DEFAULT_INTERVAL_MS = 400;

// Strict box-shape validation (relative to frame)
const CAR_BOX = {
  aspectRatio: { min: 1.25, max: 3.8 },
  area: { min: 0.002, max: 0.16 }, // 0.2% .. 16% of frame
  width: { min: 0.03, max: 0.6 },
  height: { min: 0.02, max: 0.38 },
};

// Tracking / stabilization (object-based only; no motion/optical-flow)
const TRACK = {
  matchIou: 0.3,
  nmsIou: 0.4,
  minHits: 3,
  maxMisses: 6,
  smoothAlpha: 0.25,
  stableMaxMisses: 2,
};

const DEFAULT_ROAD_ROI: RoadRoi = {
  horizonY: 0.55,
  polygon: [
    { x: 0.18, y: 0.60 },
    { x: 0.82, y: 0.60 },
    { x: 1.0, y: 1.0 },
    { x: 0.0, y: 1.0 },
  ],
  perspective: {
    minHeightAtHorizon: 0.03,
    maxHeightAtHorizon: 0.10,
    minHeightAtBottom: 0.08,
    maxHeightAtBottom: 0.38,
    minWidthAtHorizon: 0.04,
    maxWidthAtBottom: 0.70,
  },
};

const ROAD_ROIS: Record<string, RoadRoi> = {
  // London Street Patrol
  "CAM-LONDON-001": {
    horizonY: 0.52,
    polygon: [
      { x: 0.14, y: 0.56 },
      { x: 0.86, y: 0.56 },
      { x: 1.0, y: 1.0 },
      { x: 0.0, y: 1.0 },
    ],
    perspective: {
      minHeightAtHorizon: 0.03,
      maxHeightAtHorizon: 0.10,
      minHeightAtBottom: 0.08,
      maxHeightAtBottom: 0.36,
      minWidthAtHorizon: 0.04,
      maxWidthAtBottom: 0.68,
    },
  },
  // Canada Winter Traffic
  "CAM-CANADA-002": {
    horizonY: 0.54,
    polygon: [
      { x: 0.12, y: 0.60 },
      { x: 0.88, y: 0.60 },
      { x: 1.0, y: 1.0 },
      { x: 0.0, y: 1.0 },
    ],
    perspective: {
      minHeightAtHorizon: 0.03,
      maxHeightAtHorizon: 0.09,
      minHeightAtBottom: 0.08,
      maxHeightAtBottom: 0.34,
      minWidthAtHorizon: 0.04,
      maxWidthAtBottom: 0.70,
    },
  },
  // Times Square Monitor
  "CAM-NYC-003": {
    horizonY: 0.62,
    polygon: [
      { x: 0.22, y: 0.68 },
      { x: 0.78, y: 0.68 },
      { x: 0.94, y: 1.0 },
      { x: 0.06, y: 1.0 },
    ],
    perspective: {
      minHeightAtHorizon: 0.028,
      maxHeightAtHorizon: 0.085,
      minHeightAtBottom: 0.075,
      maxHeightAtBottom: 0.32,
      minWidthAtHorizon: 0.038,
      maxWidthAtBottom: 0.62,
    },
  },
  // Intersection Control
  "CAM-INT-004": {
    horizonY: 0.50,
    polygon: [
      { x: 0.16, y: 0.56 },
      { x: 0.84, y: 0.56 },
      { x: 1.0, y: 1.0 },
      { x: 0.0, y: 1.0 },
    ],
    perspective: {
      minHeightAtHorizon: 0.03,
      maxHeightAtHorizon: 0.10,
      minHeightAtBottom: 0.08,
      maxHeightAtBottom: 0.36,
      minWidthAtHorizon: 0.04,
      maxWidthAtBottom: 0.70,
    },
  },
};

function getRoi(cameraId?: string): RoadRoi {
  if (!cameraId) return DEFAULT_ROAD_ROI;
  return ROAD_ROIS[cameraId] ?? DEFAULT_ROAD_ROI;
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

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function pointInPolygon(p: Point, poly: Point[]) {
  // Ray casting
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;

    const intersect = yi > p.y !== yj > p.y && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
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

function nms(dets: NormCarDet[], iouThreshold: number) {
  const sorted = [...dets].sort((a, b) => b.confidence - a.confidence);
  const kept: NormCarDet[] = [];

  for (const d of sorted) {
    if (kept.every((k) => iou(d, k) < iouThreshold)) kept.push(d);
  }
  return kept;
}

function isRoadGrounded(det: NormCarDet, roi: RoadRoi) {
  const bottomY = det.y + det.height;
  if (bottomY < roi.horizonY) return false;

  // Ground-plane proxy: bottom edge points must lie on the road polygon.
  const bottomCenter: Point = { x: det.x + det.width / 2, y: bottomY };
  const bottomLeft: Point = { x: det.x + det.width * 0.1, y: bottomY };
  const bottomRight: Point = { x: det.x + det.width * 0.9, y: bottomY };

  return pointInPolygon(bottomCenter, roi.polygon) && pointInPolygon(bottomLeft, roi.polygon) && pointInPolygon(bottomRight, roi.polygon);
}

function passesPerspective(det: NormCarDet, roi: RoadRoi) {
  const bottomY = det.y + det.height;
  const t = clamp((bottomY - roi.horizonY) / Math.max(1e-6, 1 - roi.horizonY), 0, 1);

  const minH = lerp(roi.perspective.minHeightAtHorizon, roi.perspective.minHeightAtBottom, t);
  const maxH = lerp(roi.perspective.maxHeightAtHorizon, roi.perspective.maxHeightAtBottom, t);

  const minW = lerp(roi.perspective.minWidthAtHorizon, roi.perspective.minWidthAtHorizon * 1.2, t);
  const maxW = lerp(roi.perspective.maxWidthAtBottom * 0.35, roi.perspective.maxWidthAtBottom, t);

  return det.height >= minH && det.height <= maxH && det.width >= minW && det.width <= maxW;
}

function isValidCarBox(det: NormCarDet, roi: RoadRoi) {
  const w = det.width;
  const h = det.height;
  if (w <= 0 || h <= 0) return false;

  const area = w * h;
  const ar = w / h;

  const basicShapeOk =
    ar >= CAR_BOX.aspectRatio.min &&
    ar <= CAR_BOX.aspectRatio.max &&
    area >= CAR_BOX.area.min &&
    area <= CAR_BOX.area.max &&
    w >= CAR_BOX.width.min &&
    w <= CAR_BOX.width.max &&
    h >= CAR_BOX.height.min &&
    h <= CAR_BOX.height.max;

  if (!basicShapeOk) return false;
  if (!isRoadGrounded(det, roi)) return false;
  if (!passesPerspective(det, roi)) return false;

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

    return () => {
      cancelled = true;
    };
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
        const roi = getRoi(cameraId);

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

        // Strict: "car" only. Everything else is explicitly ignored by omission.
        const carDets: NormCarDet[] = raw
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
              confidence: r.score,
              x,
              y,
              width,
              height,
            };
          })
          .filter((d) => d.confidence >= confidenceThreshold)
          .filter((d) => isValidCarBox(d, roi));

        // Suppress duplicate boxes from the model
        const deduped = nms(carDets, TRACK.nmsIou);

        // Tracking for stability (one-to-one matching)
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

