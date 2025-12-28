import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Clock,
  Zap
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { trafficTrends, weeklyTrends, riskZones, safetyMetrics } from '@/lib/mockData';

const violationTypes = [
  { name: 'Speeding', value: 45, color: 'hsl(var(--destructive))' },
  { name: 'Red Light', value: 25, color: 'hsl(var(--warning))' },
  { name: 'Wrong Lane', value: 15, color: 'hsl(var(--primary))' },
  { name: 'No Signal', value: 10, color: 'hsl(var(--success))' },
  { name: 'Other', value: 5, color: 'hsl(var(--muted-foreground))' },
];

const monthlyComparison = [
  { month: 'Jan', accidents: 145, violations: 2340, predictions: 138 },
  { month: 'Feb', accidents: 132, violations: 2180, predictions: 128 },
  { month: 'Mar', accidents: 118, violations: 1950, predictions: 115 },
  { month: 'Apr', accidents: 98, violations: 1720, predictions: 102 },
  { month: 'May', accidents: 85, violations: 1580, predictions: 88 },
  { month: 'Jun', accidents: 72, violations: 1420, predictions: 75 },
];

export default function AnalyticsPage() {
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
            <h1 className="text-2xl font-display font-bold text-foreground">
              Analytics & Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive traffic safety analytics and trend analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Last 30 Days
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="glow" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {safetyMetrics.map((metric, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {metric.value.toLocaleString()}{metric.unit}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    metric.trend === 'down' ? 'text-success' : 
                    metric.trend === 'up' && metric.label.includes('Reduction') ? 'text-destructive' : 'text-primary'
                  }`}>
                    {metric.trend === 'down' ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : (
                      <TrendingUp className="w-4 h-4" />
                    )}
                    {Math.abs(metric.change)}
                  </div>
                </div>
                <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(Math.abs(metric.change) * 5, 100)}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className={`h-full rounded-full ${
                      metric.trend === 'down' ? 'bg-success' : 'bg-primary'
                    }`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Comparison */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Accident Prevention Trend
                </CardTitle>
                <Badge variant="outline" className="text-success border-success/30">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  50% reduction
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="month" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="accidents" 
                        name="Actual Accidents"
                        stroke="hsl(var(--destructive))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--destructive))' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="predictions" 
                        name="AI Predictions"
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Violation Types */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-primary" />
                  Violation Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={violationTypes}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {violationTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {violationTypes.map((type, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      <span className="text-xs text-muted-foreground">{type.name}</span>
                      <span className="text-xs font-semibold text-foreground ml-auto">{type.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Traffic */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Hourly Risk Pattern
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trafficTrends}>
                      <defs>
                        <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="hour" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="riskScore" 
                        stroke="hsl(var(--primary))" 
                        fill="url(#riskGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Comparison */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  Weekly Incident Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="day" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="accidents" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                AI Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Prediction Accuracy', value: 94.2, target: 95, color: 'primary' },
                  { label: 'Detection Rate', value: 98.7, target: 99, color: 'success' },
                  { label: 'False Positive Rate', value: 2.1, target: 3, color: 'warning', inverse: true },
                ].map((metric, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{metric.label}</span>
                      <span className="text-sm font-semibold text-foreground">{metric.value}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                        className={`h-full rounded-full bg-${metric.color}`}
                        style={{ backgroundColor: `hsl(var(--${metric.color}))` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Zap className="w-3 h-3" />
                      Target: {metric.target}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
