import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { alerts, formatTimeAgo } from '@/lib/mockData';

function getAlertIcon(type: string) {
  switch (type) {
    case 'danger':
      return <AlertTriangle className="w-4 h-4" />;
    case 'warning':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
  }
}

function getAlertVariant(type: string): 'alertDanger' | 'alertWarning' | 'alertInfo' {
  switch (type) {
    case 'danger':
      return 'alertDanger';
    case 'warning':
      return 'alertWarning';
    default:
      return 'alertInfo';
  }
}

function getPriorityVariant(priority: string): 'riskCritical' | 'riskHigh' | 'riskMedium' | 'riskLow' {
  switch (priority) {
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

export function AlertsPanel() {
  return (
    <div className="glass-panel p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Active Alerts
        </h3>
        <Badge variant="alertWarning">{alerts.length} Active</Badge>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border transition-all duration-200 hover:border-primary/30 cursor-pointer ${
              alert.type === 'danger' 
                ? 'bg-destructive/5 border-destructive/20' 
                : alert.type === 'warning'
                ? 'bg-warning/5 border-warning/20'
                : 'bg-primary/5 border-primary/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                alert.type === 'danger' 
                  ? 'bg-destructive/20 text-destructive' 
                  : alert.type === 'warning'
                  ? 'bg-warning/20 text-warning'
                  : 'bg-primary/20 text-primary'
              }`}>
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">{alert.title}</span>
                  <Badge variant={getPriorityVariant(alert.priority)} className="text-[10px] px-1.5">
                    {alert.priority.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2 truncate">{alert.location}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{alert.description}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(alert.timestamp)}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
