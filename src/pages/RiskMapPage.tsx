import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  AlertTriangle, 
  Filter, 
  Layers,
  Clock,
  Car,
  Shield,
} from 'lucide-react';
import { riskZones } from '@/lib/mockData';
import GoogleMapRisk from '@/components/map/GoogleMapRisk';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAP6RpkgRWtGvDW1HVx4bJX0QIrSO5S7_o';

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
              Real-time visualization with live location, heatmaps, and AI safety insights
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
                <GoogleMapRisk apiKey={GOOGLE_MAPS_API_KEY} />
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
              <CardContent className="space-y-3 max-h-[350px] overflow-y-auto">
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

            {/* AI Safety Note */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-1">
                      AI Safety Mode Active
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Share your location to receive personalized safety suggestions and real-time risk alerts.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
