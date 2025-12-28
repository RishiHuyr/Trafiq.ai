import { motion } from 'framer-motion';
import { riskZones } from '@/lib/mockData';
import { useState } from 'react';

function getRiskColor(level: string): string {
  switch (level) {
    case 'critical':
      return '#dc2626';
    case 'high':
      return '#f59e0b';
    case 'medium':
      return '#00e5cc';
    default:
      return '#22c55e';
  }
}

export function RiskHeatmap() {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  
  return (
    <div className="glass-panel p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg">Risk Heatmap</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-muted-foreground">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Critical</span>
          </div>
        </div>
      </div>
      
      {/* Stylized Map */}
      <div className="relative aspect-[16/10] bg-secondary/50 rounded-xl overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        
        {/* Road network simulation */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
          {/* Main roads */}
          <path
            d="M 0 125 L 400 125"
            stroke="hsl(222, 30%, 25%)"
            strokeWidth="8"
            fill="none"
          />
          <path
            d="M 200 0 L 200 250"
            stroke="hsl(222, 30%, 25%)"
            strokeWidth="8"
            fill="none"
          />
          <path
            d="M 50 50 L 350 200"
            stroke="hsl(222, 30%, 22%)"
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M 50 200 L 350 50"
            stroke="hsl(222, 30%, 22%)"
            strokeWidth="4"
            fill="none"
          />
          {/* Secondary roads */}
          <path
            d="M 100 0 L 100 250"
            stroke="hsl(222, 30%, 20%)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 300 0 L 300 250"
            stroke="hsl(222, 30%, 20%)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 0 75 L 400 75"
            stroke="hsl(222, 30%, 20%)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 0 175 L 400 175"
            stroke="hsl(222, 30%, 20%)"
            strokeWidth="2"
            fill="none"
          />
        </svg>
        
        {/* Risk zone markers */}
        {riskZones.map((zone, index) => {
          // Map zone positions to the viewport
          const positions = [
            { x: 200, y: 125 },  // Center intersection
            { x: 100, y: 75 },   // Top left
            { x: 300, y: 75 },   // Top right
            { x: 100, y: 175 },  // Bottom left
            { x: 300, y: 175 },  // Bottom right
            { x: 50, y: 125 },   // Left
          ];
          const pos = positions[index] || { x: 200, y: 125 };
          const isHovered = hoveredZone === zone.id;
          
          return (
            <motion.div
              key={zone.id}
              className="absolute cursor-pointer"
              style={{
                left: `${(pos.x / 400) * 100}%`,
                top: `${(pos.y / 250) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseEnter={() => setHoveredZone(zone.id)}
              onMouseLeave={() => setHoveredZone(null)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
            >
              {/* Outer pulse ring */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  backgroundColor: getRiskColor(zone.riskLevel),
                  width: `${40 + zone.riskScore * 0.4}px`,
                  height: `${40 + zone.riskScore * 0.4}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.2,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
              />
              
              {/* Main marker */}
              <motion.div
                className="relative rounded-full flex items-center justify-center font-bold text-xs shadow-lg"
                style={{
                  backgroundColor: getRiskColor(zone.riskLevel),
                  width: isHovered ? '48px' : '36px',
                  height: isHovered ? '48px' : '36px',
                  boxShadow: `0 0 20px ${getRiskColor(zone.riskLevel)}`,
                }}
                animate={{
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-background font-display">{zone.riskScore}</span>
              </motion.div>
              
              {/* Hover tooltip */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg p-3 shadow-xl z-10 min-w-[180px]"
                >
                  <div className="font-medium text-sm mb-1 whitespace-nowrap">{zone.name}</div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Incidents:</span>
                      <span className="font-medium text-foreground">{zone.incidents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Violations:</span>
                      <span className="font-medium text-foreground">{zone.violations}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Density:</span>
                      <span className="font-medium text-foreground">{zone.trafficDensity}%</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
        
        {/* City label */}
        <div className="absolute bottom-3 left-3 text-xs text-muted-foreground bg-background/60 backdrop-blur-sm px-2 py-1 rounded">
          Metro Area Coverage
        </div>
        
        {/* Compass */}
        <div className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-full h-full text-muted-foreground/50">
            <path fill="currentColor" d="M12 2L12 22M2 12L22 12" stroke="currentColor" strokeWidth="1" />
            <path fill="currentColor" d="M12 2L14 6L12 5L10 6L12 2Z" />
            <text x="12" y="9" textAnchor="middle" fontSize="4" fill="currentColor">N</text>
          </svg>
        </div>
      </div>
    </div>
  );
}
