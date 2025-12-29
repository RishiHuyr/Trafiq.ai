import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Maximize2, 
  Volume2, 
  VolumeX,
  Radio,
  Cpu,
  Car,
  AlertTriangle,
  Eye,
  Settings
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DetectedVehicle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'car' | 'truck' | 'motorcycle' | 'bus';
  risk: 'low' | 'medium' | 'high';
  confidence: number;
  speed?: number;
  violation?: string;
}

interface SimulatedTrafficFeedProps {
  videoSrc: string;
  cameraId: string;
  cameraName: string;
  location: string;
}

const vehicleTypes = ['car', 'truck', 'motorcycle', 'bus'] as const;
const riskLevels = ['low', 'medium', 'high'] as const;
const violations = ['Speeding', 'Lane Violation', 'Running Red', 'Tailgating', null];

function generateRandomVehicle(id: number): DetectedVehicle {
  const risk = riskLevels[Math.floor(Math.random() * 3)];
  return {
    id: `v-${id}-${Date.now()}`,
    x: 10 + Math.random() * 70,
    y: 20 + Math.random() * 50,
    width: 8 + Math.random() * 8,
    height: 6 + Math.random() * 6,
    type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
    risk,
    confidence: 0.75 + Math.random() * 0.24,
    speed: 20 + Math.floor(Math.random() * 60),
    violation: risk === 'high' ? violations[Math.floor(Math.random() * (violations.length - 1))] as string : 
               risk === 'medium' && Math.random() > 0.5 ? violations[Math.floor(Math.random() * (violations.length - 1))] as string : 
               undefined
  };
}

export default function SimulatedTrafficFeed({
  videoSrc,
  cameraId,
  cameraName,
  location
}: SimulatedTrafficFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [detectedVehicles, setDetectedVehicles] = useState<DetectedVehicle[]>([]);
  const [totalDetections, setTotalDetections] = useState(0);
  const [violationCount, setViolationCount] = useState(0);

  // Generate initial vehicles
  useEffect(() => {
    const initialVehicles = Array.from({ length: 4 + Math.floor(Math.random() * 4) }, (_, i) => 
      generateRandomVehicle(i)
    );
    setDetectedVehicles(initialVehicles);
    setTotalDetections(initialVehicles.length);
    setViolationCount(initialVehicles.filter(v => v.violation).length);
  }, []);

  // Simulate AI detection updates
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setDetectedVehicles(prev => {
        // Randomly modify existing vehicles (simulate movement)
        const updated = prev.map(v => ({
          ...v,
          x: Math.max(5, Math.min(85, v.x + (Math.random() - 0.5) * 3)),
          y: Math.max(15, Math.min(75, v.y + (Math.random() - 0.5) * 2)),
          confidence: Math.min(0.99, Math.max(0.7, v.confidence + (Math.random() - 0.5) * 0.05))
        }));

        // Occasionally add/remove vehicles
        if (Math.random() > 0.7 && updated.length < 10) {
          updated.push(generateRandomVehicle(Date.now()));
        }
        if (Math.random() > 0.8 && updated.length > 3) {
          updated.splice(Math.floor(Math.random() * updated.length), 1);
        }

        setTotalDetections(updated.length);
        setViolationCount(updated.filter(v => v.violation).length);
        return updated;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle video loop and playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      video.currentTime = 0;
      video.play();
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, []);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'border-destructive bg-destructive/20 text-destructive';
      case 'medium': return 'border-warning bg-warning/20 text-warning';
      default: return 'border-success bg-success/20 text-success';
    }
  };

  const getRiskBorderColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'border-destructive shadow-[0_0_10px_rgba(239,68,68,0.4)]';
      case 'medium': return 'border-warning shadow-[0_0_8px_rgba(245,158,11,0.3)]';
      default: return 'border-success shadow-[0_0_6px_rgba(34,197,94,0.3)]';
    }
  };

  const stats = useMemo(() => ({
    total: totalDetections,
    violations: violationCount,
    safe: totalDetections - violationCount
  }), [totalDetections, violationCount]);

  return (
    <Card 
      className="relative overflow-hidden bg-card border-border group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Container */}
      <div className="relative aspect-video bg-black overflow-hidden">
        {/* Video Element */}
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* AI Processing Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Scan lines effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-30" 
               style={{ backgroundSize: '100% 4px' }} />
          
          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/60" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/60" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/60" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/60" />
        </div>

        {/* Detection Bounding Boxes */}
        <AnimatePresence>
          {detectedVehicles.map((vehicle) => (
            <TooltipProvider key={vehicle.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className={`absolute border-2 rounded-sm pointer-events-auto cursor-pointer ${getRiskBorderColor(vehicle.risk)}`}
                    style={{
                      left: `${vehicle.x}%`,
                      top: `${vehicle.y}%`,
                      width: `${vehicle.width}%`,
                      height: `${vehicle.height}%`,
                    }}
                  >
                    {/* Vehicle label */}
                    <div className={`absolute -top-5 left-0 px-1.5 py-0.5 text-[9px] font-mono rounded-sm whitespace-nowrap ${getRiskColor(vehicle.risk)}`}>
                      {vehicle.type.toUpperCase()} {(vehicle.confidence * 100).toFixed(0)}%
                    </div>
                    
                    {/* Violation indicator */}
                    {vehicle.violation && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute -bottom-5 left-0 px-1.5 py-0.5 text-[8px] font-semibold bg-destructive/90 text-destructive-foreground rounded-sm whitespace-nowrap"
                      >
                        ⚠ {vehicle.violation}
                      </motion.div>
                    )}

                    {/* Corner indicators */}
                    <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-l border-t border-current" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 border-r border-t border-current" />
                    <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-l border-b border-current" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-r border-b border-current" />
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-popover/95 backdrop-blur-sm">
                  <div className="text-xs space-y-1">
                    <p className="font-semibold">{vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}</p>
                    <p>Speed: {vehicle.speed} km/h</p>
                    <p>Confidence: {(vehicle.confidence * 100).toFixed(1)}%</p>
                    {vehicle.violation && <p className="text-destructive">Violation: {vehicle.violation}</p>}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </AnimatePresence>

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          <Badge variant="default" className="bg-destructive/90 text-destructive-foreground backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold">
            <Radio className="w-3 h-3 mr-1 animate-pulse" />
            LIVE
          </Badge>
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-foreground border-border px-2 py-0.5 text-[10px]">
            <Cpu className="w-3 h-3 mr-1 text-primary" />
            AI ACTIVE
          </Badge>
        </div>

        {/* Camera ID */}
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm text-muted-foreground border-border text-[10px] font-mono">
            {cameraId}
          </Badge>
        </div>

        {/* Stats Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 z-10">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs">
            <Car className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-foreground">{stats.total}</span>
          </div>
          {stats.violations > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-destructive/80 backdrop-blur-sm rounded text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="font-semibold text-destructive-foreground">{stats.violations}</span>
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
              {/* Center Play/Pause */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="glass"
                  size="lg"
                  onClick={togglePlayPause}
                  className="w-16 h-16 rounded-full bg-background/30 backdrop-blur-md border-white/20 hover:bg-background/50 transition-all"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </Button>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="w-8 h-8 bg-background/30 backdrop-blur-sm hover:bg-background/50"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
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
      </div>
    </Card>
  );
}
