import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Check, 
  X,
  Filter,
  Clock,
  MapPin,
  ChevronRight,
  BellRing,
  BellOff,
  Settings,
  Trash2
} from 'lucide-react';
import { alerts, formatTimeAgo } from '@/lib/mockData';
import { useState } from 'react';

const allAlerts = [
  ...alerts,
  {
    id: 'alert-5',
    type: 'info' as const,
    title: 'Scheduled Maintenance',
    location: 'CAM-DT-001',
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    description: 'Camera maintenance scheduled for tonight at 2:00 AM. Expected downtime: 30 minutes.',
    priority: 'low' as const,
  },
  {
    id: 'alert-6',
    type: 'warning' as const,
    title: 'Speed Threshold Exceeded',
    location: 'Highway Exit 42',
    timestamp: new Date(Date.now() - 3 * 60 * 60000),
    description: 'Multiple vehicles detected exceeding speed limit by 20+ mph in the last hour.',
    priority: 'high' as const,
  },
  {
    id: 'alert-7',
    type: 'danger' as const,
    title: 'Near-Miss Incident',
    location: 'School Zone - Main St',
    timestamp: new Date(Date.now() - 4 * 60 * 60000),
    description: 'AI detected a potential near-miss incident involving a pedestrian. Review footage recommended.',
    priority: 'critical' as const,
  },
];

type FilterType = 'all' | 'danger' | 'warning' | 'info';
type StatusType = 'active' | 'acknowledged' | 'resolved';

export default function AlertsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());

  const filteredAlerts = allAlerts.filter(alert => 
    filter === 'all' || alert.type === filter
  );

  const alertStats = {
    total: allAlerts.length,
    critical: allAlerts.filter(a => a.priority === 'critical').length,
    high: allAlerts.filter(a => a.priority === 'high').length,
    medium: allAlerts.filter(a => a.priority === 'medium').length,
    low: allAlerts.filter(a => a.priority === 'low').length,
  };

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
              <Bell className="w-6 h-6 text-primary" />
              Alerts & Notifications
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time alerts and system notifications requiring attention
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          <Card className="bg-gradient-to-br from-muted/50 to-muted/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{alertStats.total}</p>
              <p className="text-xs text-muted-foreground">Total Alerts</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-risk-critical/10 to-risk-critical/5 border-risk-critical/20">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-risk-critical">{alertStats.critical}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{alertStats.high}</p>
              <p className="text-xs text-muted-foreground">High</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-warning">{alertStats.medium}</p>
              <p className="text-xs text-muted-foreground">Medium</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">{alertStats.low}</p>
              <p className="text-xs text-muted-foreground">Low</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters & List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { value: 'all', label: 'All Alerts', icon: Bell, count: allAlerts.length },
                  { value: 'danger', label: 'Critical', icon: AlertTriangle, count: allAlerts.filter(a => a.type === 'danger').length },
                  { value: 'warning', label: 'Warnings', icon: AlertCircle, count: allAlerts.filter(a => a.type === 'warning').length },
                  { value: 'info', label: 'Info', icon: Info, count: allAlerts.filter(a => a.type === 'info').length },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setFilter(item.value as FilterType)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      filter === item.value 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.label}</span>
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {item.count}
                    </Badge>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BellRing className="w-4 h-4 mr-2" />
                  Enable Sound
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BellOff className="w-4 h-4 mr-2" />
                  Snooze 1 Hour
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Resolved
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Alerts List */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  {filter === 'all' ? 'All Alerts' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Alerts`}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  Showing {filteredAlerts.length} alerts
                </span>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + index * 0.03 }}
                    className={`p-4 rounded-xl border transition-colors cursor-pointer group ${
                      acknowledgedAlerts.has(alert.id) 
                        ? 'bg-muted/20 border-border opacity-60' 
                        : 'bg-muted/30 hover:bg-muted/50 border-transparent hover:border-primary/20'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        alert.type === 'danger' ? 'bg-destructive/20' :
                        alert.type === 'warning' ? 'bg-warning/20' : 'bg-primary/20'
                      }`}>
                        {alert.type === 'danger' && <AlertTriangle className="w-5 h-5 text-destructive" />}
                        {alert.type === 'warning' && <AlertCircle className="w-5 h-5 text-warning" />}
                        {alert.type === 'info' && <Info className="w-5 h-5 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-sm text-foreground">{alert.title}</h3>
                          <Badge variant={
                            alert.priority === 'critical' ? 'riskCritical' :
                            alert.priority === 'high' ? 'riskHigh' :
                            alert.priority === 'medium' ? 'riskMedium' : 'riskLow'
                          } className="text-[10px]">
                            {alert.priority}
                          </Badge>
                          {acknowledgedAlerts.has(alert.id) && (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground">
                              Acknowledged
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {alert.location}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(alert.timestamp)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!acknowledgedAlerts.has(alert.id) && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAcknowledgedAlerts(prev => new Set([...prev, alert.id]));
                            }}
                          >
                            <Check className="w-4 h-4 text-success" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <X className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
