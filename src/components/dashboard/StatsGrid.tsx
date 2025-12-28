import { motion } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  Camera, 
  TrendingDown, 
  TrendingUp,
  Shield,
  Users,
  Clock,
  MapPin
} from 'lucide-react';
import { impactStats, safetyMetrics } from '@/lib/mockData';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  unit?: string;
  delay?: number;
  highlight?: boolean;
}

function StatCard({ icon, label, value, change, trend, unit, delay = 0, highlight }: StatCardProps) {
  const isPositive = trend === 'down' ? change && change < 0 : change && change > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glass-panel-hover p-5 ${highlight ? 'border-primary/30 glow-primary' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${highlight ? 'bg-primary/20' : 'bg-secondary'}`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            isPositive ? 'text-success' : 'text-destructive'
          }`}>
            {trend === 'down' ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <TrendingUp className="w-3 h-3" />
            )}
            {Math.abs(change)}{unit === '%' ? '%' : ''}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-2xl font-display font-bold mt-1 text-foreground">
          {value}{unit && unit !== '%' ? <span className="text-lg ml-1">{unit}</span> : null}
        </p>
      </div>
    </motion.div>
  );
}

export function StatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Shield className="w-5 h-5 text-primary" />}
        label="Accidents Prevented"
        value={impactStats.accidentsPreventedThisMonth}
        change={-23}
        trend="down"
        unit="%"
        delay={0}
        highlight
      />
      <StatCard
        icon={<Users className="w-5 h-5 text-success" />}
        label="Lives Protected"
        value={impactStats.livesProtected}
        change={18}
        trend="up"
        delay={0.1}
      />
      <StatCard
        icon={<Activity className="w-5 h-5 text-warning" />}
        label="Prediction Accuracy"
        value={`${impactStats.predictionAccuracy}%`}
        change={2.4}
        trend="up"
        delay={0.2}
      />
      <StatCard
        icon={<Camera className="w-5 h-5 text-primary" />}
        label="Active Cameras"
        value={impactStats.activeCameras}
        change={6}
        trend="up"
        delay={0.3}
      />
    </div>
  );
}

export function MetricsRow() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {safetyMetrics.map((metric, index) => (
        <StatCard
          key={metric.label}
          icon={
            index === 0 ? <TrendingDown className="w-5 h-5 text-success" /> :
            index === 1 ? <Clock className="w-5 h-5 text-primary" /> :
            index === 2 ? <AlertTriangle className="w-5 h-5 text-warning" /> :
            <MapPin className="w-5 h-5 text-primary" />
          }
          label={metric.label}
          value={metric.value}
          change={metric.change}
          trend={metric.trend}
          unit={metric.unit}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}
