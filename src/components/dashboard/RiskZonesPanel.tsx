import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { riskZones } from '@/lib/mockData';
import { MapPin, TrendingUp, Clock, ChevronRight } from 'lucide-react';

function getRiskVariant(level: string): 'riskCritical' | 'riskHigh' | 'riskMedium' | 'riskLow' {
  switch (level) {
    case 'critical':
      return 'riskCritical';
    case 'high':
      return 'riskHigh';
    case 'medium':
      return 'riskMedium';
    default:
      return 'riskLow';
  }
}

function getRiskColor(level: string): string {
  switch (level) {
    case 'critical':
      return 'bg-destructive';
    case 'high':
      return 'bg-destructive/80';
    case 'medium':
      return 'bg-warning';
    default:
      return 'bg-success';
  }
}

export function RiskZonesPanel() {
  const sortedZones = [...riskZones].sort((a, b) => b.riskScore - a.riskScore);
  
  return (
    <div className="glass-panel p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          High-Risk Zones
        </h3>
        <Badge variant="outline">{riskZones.length} Zones</Badge>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {sortedZones.map((zone, index) => (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">{zone.name}</h4>
                  <Badge variant={getRiskVariant(zone.riskLevel)} className="text-[10px]">
                    {zone.riskLevel.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Peak: {zone.peakHours}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-display font-bold text-foreground">{zone.riskScore}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Risk Score</div>
              </div>
            </div>
            
            {/* Risk Bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${zone.riskScore}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`h-full rounded-full ${getRiskColor(zone.riskLevel)}`}
              />
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-background/50">
                <div className="text-sm font-semibold">{zone.incidents}</div>
                <div className="text-[10px] text-muted-foreground">Incidents</div>
              </div>
              <div className="p-2 rounded-lg bg-background/50">
                <div className="text-sm font-semibold">{zone.violations}</div>
                <div className="text-[10px] text-muted-foreground">Violations</div>
              </div>
              <div className="p-2 rounded-lg bg-background/50">
                <div className="text-sm font-semibold">{zone.trafficDensity}%</div>
                <div className="text-[10px] text-muted-foreground">Density</div>
              </div>
            </div>
            
            {/* View Details */}
            <div className="flex items-center justify-end mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              View Recommendations <ChevronRight className="w-3 h-3 ml-1" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
