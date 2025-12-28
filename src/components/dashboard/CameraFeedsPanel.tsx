import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cameraFeeds } from '@/lib/mockData';
import { Camera, Car, AlertTriangle, Radio, Signal } from 'lucide-react';
import { useState, useEffect } from 'react';

function getStatusVariant(status: string): 'online' | 'offline' | 'processing' {
  return status as 'online' | 'offline' | 'processing';
}

function getRiskClass(level: string): string {
  switch (level) {
    case 'high':
      return 'text-destructive';
    case 'medium':
      return 'text-warning';
    default:
      return 'text-success';
  }
}

export function CameraFeedsPanel() {
  const [vehicleCounts, setVehicleCounts] = useState<Record<string, number>>({});
  
  // Simulate real-time vehicle count updates
  useEffect(() => {
    const initial: Record<string, number> = {};
    cameraFeeds.forEach(cam => {
      initial[cam.id] = cam.vehicleCount;
    });
    setVehicleCounts(initial);
    
    const interval = setInterval(() => {
      setVehicleCounts(prev => {
        const updated = { ...prev };
        cameraFeeds.forEach(cam => {
          const delta = Math.floor(Math.random() * 10) - 5;
          updated[cam.id] = Math.max(0, (prev[cam.id] || cam.vehicleCount) + delta);
        });
        return updated;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Live Camera Feeds
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">
              {cameraFeeds.filter(c => c.status === 'online').length} Online
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameraFeeds.map((camera, index) => (
          <motion.div
            key={camera.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative rounded-xl overflow-hidden bg-background border border-border group hover:border-primary/30 transition-all duration-200"
          >
            {/* Simulated Video Feed */}
            <div className="aspect-video bg-gradient-to-br from-muted to-background relative overflow-hidden">
              {/* Grid overlay to simulate camera feed */}
              <div className="absolute inset-0 grid-pattern opacity-20" />
              
              {/* Scanning animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent data-flow" />
              </div>
              
              {/* Detection boxes simulation */}
              <motion.div
                className="absolute top-1/4 left-1/4 w-16 h-12 border-2 border-primary rounded"
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute top-1/3 right-1/4 w-14 h-10 border-2 border-warning rounded"
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <motion.div
                className="absolute bottom-1/3 left-1/3 w-12 h-8 border-2 border-success rounded"
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              />
              
              {/* Camera ID overlay */}
              <div className="absolute top-2 left-2 flex items-center gap-2">
                <Badge variant={getStatusVariant(camera.status)} className="text-[10px]">
                  <Radio className="w-2.5 h-2.5 mr-1" />
                  {camera.status.toUpperCase()}
                </Badge>
              </div>
              
              {/* Recording indicator */}
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-destructive/80 px-1.5 py-0.5 rounded text-[10px] text-destructive-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
                REC
              </div>
              
              {/* AI Processing indicator */}
              <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-lg">
                <div className="flex items-center gap-1.5 text-[10px] text-primary">
                  <Signal className="w-3 h-3 animate-pulse" />
                  AI Processing
                </div>
              </div>
            </div>
            
            {/* Camera Info */}
            <div className="p-3 bg-card/50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-sm">{camera.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{camera.location}</p>
                </div>
                <Badge variant={getRiskVariant(camera.riskLevel)} className="text-[10px]">
                  {camera.riskLevel.toUpperCase()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                  <Car className="w-4 h-4 text-primary" />
                  <div>
                    <motion.div 
                      key={vehicleCounts[camera.id]}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm font-semibold"
                    >
                      {vehicleCounts[camera.id] || camera.vehicleCount}
                    </motion.div>
                    <div className="text-[10px] text-muted-foreground">Vehicles</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                  <AlertTriangle className={`w-4 h-4 ${getRiskClass(camera.riskLevel)}`} />
                  <div>
                    <div className="text-sm font-semibold">{camera.violations}</div>
                    <div className="text-[10px] text-muted-foreground">Violations</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function getRiskVariant(level: string): 'riskHigh' | 'riskMedium' | 'riskLow' {
  switch (level) {
    case 'high':
      return 'riskHigh';
    case 'medium':
      return 'riskMedium';
    default:
      return 'riskLow';
  }
}
