import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Brain, 
  Lightbulb, 
  AlertTriangle,
  TrendingUp,
  Shield,
  Clock,
  MapPin,
  ChevronRight,
  Zap,
  Target,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { topRecommendations, riskZones, impactStats } from '@/lib/mockData';

const aiInsights = [
  {
    id: 1,
    type: 'prediction',
    title: 'Rush Hour Risk Spike Predicted',
    description: 'AI models predict a 35% increase in accident probability at Downtown Intersection A between 5:00 PM - 6:30 PM today based on weather conditions and historical patterns.',
    confidence: 92,
    priority: 'high',
    actionable: true,
    timestamp: '2 minutes ago',
  },
  {
    id: 2,
    type: 'pattern',
    title: 'New Violation Pattern Detected',
    description: 'Increased red-light violations at Highway Exit 42 correlate with recent signal timing changes. Consider reverting to previous configuration.',
    confidence: 87,
    priority: 'medium',
    actionable: true,
    timestamp: '15 minutes ago',
  },
  {
    id: 3,
    type: 'optimization',
    title: 'Enforcement Optimization Opportunity',
    description: 'Reallocating patrol units from Residential Area - Oak Ave to School Zone - Main St during 7:30-8:30 AM could reduce violations by 28%.',
    confidence: 89,
    priority: 'medium',
    actionable: true,
    timestamp: '1 hour ago',
  },
  {
    id: 4,
    type: 'anomaly',
    title: 'Unusual Traffic Pattern',
    description: 'Traffic density at Bridge Entrance - West is 40% higher than typical for this time. No known events in the area. Monitoring for potential incidents.',
    confidence: 94,
    priority: 'high',
    actionable: false,
    timestamp: '5 minutes ago',
  },
];

const modelPerformance = [
  { name: 'Risk Prediction Model', accuracy: 94.2, status: 'optimal' },
  { name: 'Vehicle Detection Model', accuracy: 98.7, status: 'optimal' },
  { name: 'Violation Classification', accuracy: 91.5, status: 'good' },
  { name: 'Congestion Forecasting', accuracy: 88.3, status: 'good' },
];

export default function AIInsightsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              AI Insights
            </h1>
            <p className="text-muted-foreground mt-1">
              Intelligent analysis and predictive recommendations powered by machine learning
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-success border-success/30">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse mr-2" />
              AI Models Active
            </Badge>
            <Button variant="glow" size="sm">
              <Brain className="w-4 h-4 mr-2" />
              Run Analysis
            </Button>
          </div>
        </motion.div>

        {/* AI Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{impactStats.predictionAccuracy}%</p>
                  <p className="text-xs text-muted-foreground">Prediction Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-success">{impactStats.accidentsPreventedThisMonth}</p>
                  <p className="text-xs text-muted-foreground">Accidents Prevented</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{aiInsights.length}</p>
                  <p className="text-xs text-muted-foreground">Active Insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{modelPerformance.length}</p>
                  <p className="text-xs text-muted-foreground">AI Models Running</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Insights Feed */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  Real-time AI Insights
                </CardTitle>
                <Badge variant="secondary">{aiInsights.length} new</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-primary/20 cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        insight.type === 'prediction' ? 'bg-primary/20' :
                        insight.type === 'pattern' ? 'bg-warning/20' :
                        insight.type === 'optimization' ? 'bg-success/20' : 'bg-destructive/20'
                      }`}>
                        {insight.type === 'prediction' && <Brain className="w-5 h-5 text-primary" />}
                        {insight.type === 'pattern' && <TrendingUp className="w-5 h-5 text-warning" />}
                        {insight.type === 'optimization' && <Zap className="w-5 h-5 text-success" />}
                        {insight.type === 'anomaly' && <AlertTriangle className="w-5 h-5 text-destructive" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm text-foreground">{insight.title}</h3>
                          <Badge variant={
                            insight.priority === 'high' ? 'riskHigh' :
                            insight.priority === 'medium' ? 'riskMedium' : 'riskLow'
                          } className="text-[10px]">
                            {insight.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {insight.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {insight.timestamp}
                          </span>
                          <span className="text-xs text-primary flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {insight.confidence}% confidence
                          </span>
                          {insight.actionable && (
                            <Badge variant="outline" className="text-xs text-success border-success/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Actionable
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Model Performance */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Brain className="w-4 h-4 text-primary" />
                    Model Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {modelPerformance.map((model, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{model.name}</span>
                        <span className="text-xs font-semibold text-foreground">{model.accuracy}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${model.accuracy}%` }}
                          transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                          className={`h-full rounded-full ${
                            model.status === 'optimal' ? 'bg-success' : 'bg-primary'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Recommendations */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {topRecommendations.slice(0, 3).map((rec, index) => (
                    <div 
                      key={rec.id}
                      className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <Badge variant={
                          rec.priority === 'critical' ? 'riskCritical' :
                          rec.priority === 'high' ? 'riskHigh' : 'riskMedium'
                        } className="text-[10px] mt-0.5">
                          {rec.priority}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {rec.action}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {rec.location}
                          </div>
                          <p className="text-xs text-success mt-1">
                            {rec.expectedImpact}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
