import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { topRecommendations } from '@/lib/mockData';
import { Lightbulb, MapPin, Clock, TrendingUp, ChevronRight, Sparkles } from 'lucide-react';

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'bg-destructive/20 text-destructive border-destructive/30';
    case 'high':
      return 'bg-warning/20 text-warning border-warning/30';
    case 'medium':
      return 'bg-primary/20 text-primary border-primary/30';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

export function RecommendationsPanel() {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Recommendations
        </h3>
        <Button variant="ghost" size="sm" className="text-xs">
          View All <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
      
      <div className="space-y-4">
        {topRecommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getPriorityColor(rec.priority)}`}>
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant={rec.priority === 'critical' ? 'riskCritical' : rec.priority === 'high' ? 'riskHigh' : 'riskMedium'} className="text-[10px]">
                    {rec.priority.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {rec.location}
                  </span>
                </div>
                
                <h4 className="font-medium text-sm mb-2">{rec.action}</h4>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-success" />
                    <span className="text-success">{rec.expectedImpact}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {rec.timeframe}
                  </div>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity text-primary"
              >
                Apply
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
