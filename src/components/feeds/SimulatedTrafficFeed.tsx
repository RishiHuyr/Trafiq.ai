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
  targetX: number;
  targetY: number;
  width: number;
  height: number;
  type: 'car' | 'truck' | 'motorcycle' | 'bus';
  risk: 'low' | 'medium' | 'high';
  confidence: number;
  speed: number;
  direction: 'left' | 'right' | 'up' | 'down';
  lane: number;
  violation?: string;
  trackingId: number;
  framesVisible: number;
}

interface SimulatedTrafficFeedProps {
  videoSrc: string;
  cameraId: string;
  cameraName: string;
  location: string;
}

// Vehicle class configurations with realistic sizes
const vehicleConfigs = {
  car: { width: 6, height: 4, minSpeed: 30, maxSpeed: 60, weight: 0.6 },
  truck: { width: 10, height: 5, minSpeed: 25, maxSpeed: 50, weight: 0.15 },
  bus: { width: 12, height: 5, minSpeed: 20, maxSpeed: 45, weight: 0.1 },
  motorcycle: { width: 3, height: 2.5, minSpeed: 35, maxSpeed: 70, weight: 0.15 }
} as const;

const vehicleTypes = Object.keys(vehicleConfigs) as (keyof typeof vehicleConfigs)[];

// Predefined lane positions for realistic traffic flow
const lanes = [
  { y: 30, direction: 'right' as const },
  { y: 45, direction: 'right' as const },
  { y: 55, direction: 'left' as const },
  { y: 70, direction: 'left' as const }
];

const CONFIDENCE_THRESHOLD = 0.82;
const MIN_FRAMES_VISIBLE = 3;

let globalTrackingId = 0;

function selectVehicleType(): keyof typeof vehicleConfigs {
  const rand = Math.random();
  let cumulative = 0;
  for (const [type, config] of Object.entries(vehicleConfigs)) {
    cumulative += config.weight;
    if (rand < cumulative) return type as keyof typeof vehicleConfigs;
  }
  return 'car';
}

function generateVehicle(laneIndex: number): DetectedVehicle {
  const lane = lanes[laneIndex];
  const type = selectVehicleType();
  const config = vehicleConfigs[type];
  
  // Start from edge based on lane direction
  const startX = lane.direction === 'right' ? -5 : 105;
  const targetX = lane.direction === 'right' ? 105 : -5;
  
  // Add slight lane variation for realism
  const yVariation = (Math.random() - 0.5) * 4;
  
  const speed = config.minSpeed + Math.random() * (config.maxSpeed - config.minSpeed);
  
  // Risk assessment based on speed and type
  let risk: 'low' | 'medium' | 'high' = 'low';
  const speedRatio = speed / config.maxSpeed;
  if (speedRatio > 0.9) risk = 'high';
  else if (speedRatio > 0.75) risk = 'medium';
  
  // Violations only for high-risk vehicles with low probability
  let violation: string | undefined;
  if (risk === 'high' && Math.random() > 0.7) {
    violation = ['Speeding', 'Tailgating'][Math.floor(Math.random() * 2)];
  } else if (risk === 'medium' && Math.random() > 0.85) {
    violation = 'Lane Drift';
  }
  
  globalTrackingId++;
  
  return {
    id: `v-${globalTrackingId}`,
    x: startX,
    y: lane.y + yVariation,
    targetX,
    targetY: lane.y + yVariation,
    width: config.width + (Math.random() - 0.5) * 1,
    height: config.height + (Math.random() - 0.5) * 0.5,
    type,
    risk,
    confidence: 0.85 + Math.random() * 0.14,
    speed: Math.round(speed),
    direction: lane.direction,
    lane: laneIndex,
    violation,
    trackingId: globalTrackingId,
    framesVisible: 0
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

  // Initialize with vehicles already in frame
  useEffect(() => {
    const initialVehicles: DetectedVehicle[] = [];
    lanes.forEach((lane, laneIndex) => {
      // Add 1-2 vehicles per lane at random positions
      const count = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        const vehicle = generateVehicle(laneIndex);
        // Position them within visible area
        vehicle.x = 15 + Math.random() * 70;
        vehicle.framesVisible = MIN_FRAMES_VISIBLE + 1;
        initialVehicles.push(vehicle);
      }
    });
    setDetectedVehicles(initialVehicles);
  }, []);

  // Simulate realistic vehicle movement and detection
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setDetectedVehicles(prev => {
        let updated = prev.map(v => {
          // Calculate movement based on speed (pixels per frame)
          const speedFactor = v.speed / 500;
          const moveX = v.direction === 'right' ? speedFactor * 8 : -speedFactor * 8;
          
          // Smooth interpolation towards target
          const newX = v.x + moveX;
          
          // Slight confidence fluctuation (stable)
          const confidenceJitter = (Math.random() - 0.5) * 0.02;
          const newConfidence = Math.min(0.99, Math.max(0.8, v.confidence + confidenceJitter));
          
          return {
            ...v,
            x: newX,
            confidence: newConfidence,
            framesVisible: v.framesVisible + 1
          };
        });

        // Remove vehicles that have left the frame
        updated = updated.filter(v => v.x > -10 && v.x < 110);

        // Spawn new vehicles with controlled rate (prevent overcrowding)
        lanes.forEach((lane, laneIndex) => {
          const vehiclesInLane = updated.filter(v => v.lane === laneIndex);
          const lastVehicle = vehiclesInLane[vehiclesInLane.length - 1];
          
          // Only spawn if lane isn't too crowded and there's space
          const canSpawn = vehiclesInLane.length < 3 && 
            (!lastVehicle || 
              (lane.direction === 'right' && lastVehicle.x > 20) ||
              (lane.direction === 'left' && lastVehicle.x < 80));
          
          if (canSpawn && Math.random() > 0.92) {
            updated.push(generateVehicle(laneIndex));
          }
        });

        // Filter by confidence threshold for display
        const visible = updated.filter(v => 
          v.confidence >= CONFIDENCE_THRESHOLD && 
          v.framesVisible >= MIN_FRAMES_VISIBLE &&
          v.x > 0 && v.x < 100
        );
        
        setTotalDetections(visible.length);
        setViolationCount(visible.filter(v => v.violation).length);
        
        return updated;
      });
    }, 100); // Faster updates for smoother animation

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

        {/* Detection Bounding Boxes - Only show confident, stable detections */}
        <AnimatePresence mode="popLayout">
          {detectedVehicles
            .filter(v => 
              v.confidence >= CONFIDENCE_THRESHOLD && 
              v.framesVisible >= MIN_FRAMES_VISIBLE &&
              v.x > 2 && v.x < 98
            )
            .map((vehicle) => (
            <TooltipProvider key={vehicle.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: 1,
                      left: `${vehicle.x}%`,
                      top: `${vehicle.y}%`,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                      layout: { duration: 0.1, ease: "linear" },
                      opacity: { duration: 0.2 }
                    }}
                    className={`absolute border-2 rounded-sm pointer-events-auto cursor-pointer ${getRiskBorderColor(vehicle.risk)}`}
                    style={{
                      width: `${vehicle.width}%`,
                      height: `${vehicle.height}%`,
                    }}
                  >
                    {/* Vehicle label - only show for confident detections */}
                    <div className={`absolute -top-5 left-0 px-1.5 py-0.5 text-[9px] font-mono rounded-sm whitespace-nowrap ${getRiskColor(vehicle.risk)}`}>
                      {vehicle.type.toUpperCase()} {(vehicle.confidence * 100).toFixed(0)}%
                    </div>
                    
                    {/* Violation indicator */}
                    {vehicle.violation && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
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
                    <p>Track ID: #{vehicle.trackingId}</p>
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
