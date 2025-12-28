import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  AlertTriangle, 
  TrendingUp, 
  Filter, 
  Layers,
  ZoomIn,
  ZoomOut,
  Locate,
  Clock,
  Car,
  Shield
} from 'lucide-react';
import { riskZones, getRiskLevelColor } from '@/lib/mockData';

export default function RiskMapPage() {
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
              Risk Map
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time visualization of traffic risk zones across the monitored area
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Layers className="w-4 h-4 mr-2" />
              Layers
            </Button>
            <Button variant="glow" size="sm">
              <Locate className="w-4 h-4 mr-2" />
              My Location
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Area */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <Card className="overflow-hidden h-[600px]">
              <CardContent className="p-0 h-full relative">
                {/* Stylized Map Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-background via-sidebar to-background">
                  {/* Grid overlay */}
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `
                        linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: '50px 50px'
                    }}
                  />
                  
                  {/* Risk zone markers */}
                  {riskZones.map((zone, index) => {
                    const left = 15 + (index % 3) * 30 + Math.random() * 10;
                    const top = 15 + Math.floor(index / 3) * 40 + Math.random() * 10;
                    return (
                      <motion.div
                        key={zone.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="absolute cursor-pointer group"
                        style={{ left: `${left}%`, top: `${top}%` }}
                      >
                        {/* Pulse animation for high risk */}
                        {(zone.riskLevel === 'critical' || zone.riskLevel === 'high') && (
                          <div 
                            className="absolute inset-0 rounded-full animate-ping"
                            style={{ 
                              backgroundColor: getRiskLevelColor(zone.riskLevel),
                              opacity: 0.3
                            }}
                          />
                        )}
                        
                        {/* Marker */}
                        <div 
                          className="relative w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg transform group-hover:scale-110 transition-transform"
                          style={{ 
                            backgroundColor: `${getRiskLevelColor(zone.riskLevel)}20`,
                            borderColor: getRiskLevelColor(zone.riskLevel),
                            boxShadow: `0 0 20px ${getRiskLevelColor(zone.riskLevel)}40`
                          }}
                        >
                          <span className="text-xs font-bold" style={{ color: getRiskLevelColor(zone.riskLevel) }}>
                            {zone.riskScore}
                          </span>
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-xl min-w-[200px]">
                            <p className="font-semibold text-sm text-foreground">{zone.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {zone.incidents} incidents • {zone.violations} violations
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {/* Map controls */}
                  <div className="absolute right-4 top-4 flex flex-col gap-2">
                    <Button variant="glass" size="icon" className="w-10 h-10">
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="glass" size="icon" className="w-10 h-10">
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Legend */}
                  <div className="absolute left-4 bottom-4 bg-popover/90 backdrop-blur-sm border border-border rounded-lg p-4">
                    <p className="text-xs font-semibold text-foreground mb-3">Risk Levels</p>
                    <div className="space-y-2">
                      {[
                        { level: 'critical', label: 'Critical (80-100)' },
                        { level: 'high', label: 'High (60-79)' },
                        { level: 'medium', label: 'Medium (40-59)' },
                        { level: 'low', label: 'Low (0-39)' },
                      ].map(({ level, label }) => (
                        <div key={level} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getRiskLevelColor(level) }}
                          />
                          <span className="text-xs text-muted-foreground">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar - Zone List */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Active Risk Zones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {riskZones.map((zone, index) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-primary/20"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {zone.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {zone.incidents}
                          </span>
                          <span className="flex items-center gap-1">
                            <Car className="w-3 h-3" />
                            {zone.trafficDensity}%
                          </span>
                        </div>
                      </div>
                      <Badge variant={
                        zone.riskLevel === 'critical' ? 'riskCritical' :
                        zone.riskLevel === 'high' ? 'riskHigh' :
                        zone.riskLevel === 'medium' ? 'riskMedium' : 'riskLow'
                      }>
                        {zone.riskScore}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Peak: {zone.peakHours}
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Zone Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Critical Zones</span>
                  <span className="text-sm font-semibold text-risk-critical">
                    {riskZones.filter(z => z.riskLevel === 'critical').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">High Risk Zones</span>
                  <span className="text-sm font-semibold text-destructive">
                    {riskZones.filter(z => z.riskLevel === 'high').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Medium Risk Zones</span>
                  <span className="text-sm font-semibold text-warning">
                    {riskZones.filter(z => z.riskLevel === 'medium').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Low Risk Zones</span>
                  <span className="text-sm font-semibold text-success">
                    {riskZones.filter(z => z.riskLevel === 'low').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
