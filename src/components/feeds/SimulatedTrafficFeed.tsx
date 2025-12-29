import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Maximize2,
  Volume2,
  VolumeX,
  Radio,
  Cpu,
  Car,
  Eye,
  Settings,
} from "lucide-react";
import { useCarDetection } from "@/hooks/useCarDetection";

interface SimulatedTrafficFeedProps {
  videoSrc: string;
  cameraId: string;
  cameraName: string;
  location: string;
}

export default function SimulatedTrafficFeed({
  videoSrc,
  cameraId,
  cameraName,
  location,
}: SimulatedTrafficFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Fast car-only detection
  const { cars, isModelLoading, error } = useCarDetection({
    videoRef,
    enabled: isPlaying,
    cameraId,
    confidenceThreshold: 0.75,
    intervalMs: 200,
  });

  const stats = useMemo(() => {
    return {
      total: cars.length,
      avgConfidence:
        cars.length > 0 ? cars.reduce((acc, c) => acc + c.confidence, 0) / cars.length : 0,
    };
  }, [cars]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) video.pause();
    else void video.play();

    setIsPlaying((v) => !v);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted((v) => !v);
  }, [isMuted]);

  return (
    <Card
      className="relative overflow-hidden bg-card border-border group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Container */}
      <div className="relative aspect-video bg-black overflow-hidden">
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Subtle processing frame */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-primary/50" />
          <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-primary/50" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-primary/50" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-primary/50" />
        </div>

        {/* Car-only Bounding Boxes - grounded on road */}
        <AnimatePresence mode="popLayout">
          {cars.map((car) => (
            <motion.div
              key={car.id}
              layout
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                left: `${car.x}%`,
                top: `${car.y}%`,
              }}
              exit={{ opacity: 0 }}
              transition={{ layout: { duration: 0.1, ease: "linear" }, opacity: { duration: 0.15 } }}
              className="absolute border-2 border-success rounded-sm pointer-events-none shadow-[0_0_8px_rgba(34,197,94,0.5)]"
              style={{ width: `${car.width}%`, height: `${car.height}%` }}
            >
              {/* Label at bottom of box */}
              <div className="absolute -bottom-5 left-0 px-1.5 py-0.5 text-[9px] font-mono rounded-sm whitespace-nowrap bg-success/90 text-success-foreground">
                CAR {(car.confidence * 100).toFixed(0)}%
              </div>

              {/* Corner ticks */}
              <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 border-l border-t border-success" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 border-r border-t border-success" />
              <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 border-l border-b border-success" />
              <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border-r border-b border-success" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          <Badge
            variant="default"
            className="bg-destructive/90 text-destructive-foreground backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold"
          >
            <Radio className="w-3 h-3 mr-1 animate-pulse" />
            LIVE
          </Badge>

          <Badge
            variant="outline"
            className="bg-background/80 backdrop-blur-sm text-foreground border-border px-2 py-0.5 text-[10px]"
          >
            <Cpu className="w-3 h-3 mr-1 text-primary" />
            {isModelLoading ? "LOADING..." : error ? "ERROR" : "AI ACTIVE"}
          </Badge>
        </div>

        {/* Camera ID */}
        <div className="absolute top-3 right-3 z-10">
          <Badge
            variant="outline"
            className="bg-background/80 backdrop-blur-sm text-muted-foreground border-border text-[10px] font-mono"
          >
            {cameraId}
          </Badge>
        </div>

        {/* Stats Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 z-10">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs">
            <Car className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-foreground">{stats.total}</span>
          </div>
          {stats.avgConfidence > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs">
              <span className="text-muted-foreground">Avg</span>
              <span className="font-semibold text-foreground">{(stats.avgConfidence * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>

        {/* Control Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="glass"
                  size="lg"
                  onClick={togglePlayPause}
                  className="w-16 h-16 rounded-full bg-background/30 backdrop-blur-md border-white/20 hover:bg-background/50 transition-all"
                >
                  {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
                </Button>
              </div>

              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="w-8 h-8 bg-background/30 backdrop-blur-sm hover:bg-background/50"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 bg-background/30 backdrop-blur-sm hover:bg-background/50"
                >
                  <Maximize2 className="w-4 h-4 text-white" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 bg-background/30 backdrop-blur-sm hover:bg-background/50"
                >
                  <Settings className="w-4 h-4 text-white" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border bg-card/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-foreground">{cameraName}</h3>
            <p className="text-xs text-muted-foreground">{location}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="w-3.5 h-3.5" />
              <span>1080p</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          </div>
        </div>
        {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}
      </div>
    </Card>
  );
}
