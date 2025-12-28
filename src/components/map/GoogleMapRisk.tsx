import { useCallback, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Camera, MapPin, Navigation, Shield, Zap } from 'lucide-react';
import { riskZones, getRiskLevelColor } from '@/lib/mockData';

interface UserLocation {
  lat: number;
  lng: number;
}

interface GoogleMapRiskProps {
  apiKey: string;
}

// Mock camera locations
const trafficCameras = [
  { id: 'cam-1', lat: 40.7128, lng: -74.006, name: 'Downtown Cam A', status: 'active' },
  { id: 'cam-2', lat: 40.7189, lng: -74.002, name: 'Main St Cam', status: 'active' },
  { id: 'cam-3', lat: 40.7082, lng: -74.012, name: 'Bridge Cam', status: 'active' },
  { id: 'cam-4', lat: 40.7250, lng: -73.998, name: 'Highway Cam', status: 'maintenance' },
];

export default function GoogleMapRisk({ apiKey }: GoogleMapRiskProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<typeof riskZones[0] | null>(null);

  const defaultCenter = useMemo(() => ({ lat: 40.7128, lng: -74.006 }), []);

  const handleLocateUser = useCallback(() => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(newLocation);
        setIsLocating(false);
      },
      (error) => {
        setLocationError(`Unable to retrieve location: ${error.message}`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Calculate AI safety suggestions based on user location
  const safetySuggestions = useMemo(() => {
    if (!userLocation) return null;

    // Find nearby risk zones
    const nearbyZones = riskZones.filter(zone => {
      const distance = Math.sqrt(
        Math.pow(zone.lat - userLocation.lat, 2) + 
        Math.pow(zone.lng - userLocation.lng, 2)
      );
      return distance < 0.02; // ~2km radius
    });

    const highestRisk = nearbyZones.sort((a, b) => b.riskScore - a.riskScore)[0];
    const hour = new Date().getHours();
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    const isNight = hour >= 21 || hour <= 5;

    return {
      overallRisk: highestRisk?.riskLevel || 'low',
      riskScore: highestRisk?.riskScore || 15,
      nearbyZones: nearbyZones.length,
      warnings: [
        ...(isRushHour ? ['Rush hour traffic - expect delays and increased violation risk'] : []),
        ...(isNight ? ['Reduced visibility - maintain safe following distance'] : []),
        ...(highestRisk?.riskLevel === 'critical' ? [`Critical zone ahead: ${highestRisk.name}`] : []),
        ...(highestRisk?.riskLevel === 'high' ? [`High-risk area nearby: ${highestRisk.name}`] : []),
      ],
      recommendations: [
        'Stay alert at intersections - 60% of accidents occur here',
        ...(nearbyZones.length > 2 ? ['Multiple risk zones in area - reduce speed'] : []),
        ...(isRushHour ? ['Consider alternate route to avoid congestion'] : []),
        'Report any hazards to help protect other drivers',
      ],
      dangerousIntersections: nearbyZones.filter(z => z.riskLevel === 'high' || z.riskLevel === 'critical'),
    };
  }, [userLocation]);

  // Generate Google Maps Embed URL
  const mapUrl = useMemo(() => {
    const center = userLocation || defaultCenter;
    const markers = riskZones.map(zone => 
      `markers=color:${zone.riskLevel === 'critical' || zone.riskLevel === 'high' ? 'red' : zone.riskLevel === 'medium' ? 'orange' : 'green'}%7Clabel:${zone.riskScore}%7C${zone.lat},${zone.lng}`
    ).join('&');
    
    const userMarker = userLocation 
      ? `&markers=color:blue%7Clabel:U%7C${userLocation.lat},${userLocation.lng}` 
      : '';
    
    return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${center.lat},${center.lng}&zoom=13&maptype=roadmap`;
  }, [apiKey, userLocation, defaultCenter]);

  return (
    <div className="relative h-full w-full">
      {/* Google Maps Embed */}
      <iframe
        src={mapUrl}
        className="absolute inset-0 w-full h-full border-0"
        style={{ filter: 'invert(90%) hue-rotate(180deg)' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* Custom overlay for risk zones */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid overlay effect */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.2) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Risk Zone Indicators (floating markers) */}
      <div className="absolute inset-0 pointer-events-none">
        {riskZones.slice(0, 4).map((zone, index) => {
          const positions = [
            { left: '25%', top: '30%' },
            { left: '55%', top: '25%' },
            { left: '35%', top: '55%' },
            { left: '65%', top: '60%' },
          ];
          const pos = positions[index];
          
          return (
            <motion.div
              key={zone.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="absolute pointer-events-auto cursor-pointer"
              style={{ left: pos.left, top: pos.top }}
              onClick={() => setSelectedZone(selectedZone?.id === zone.id ? null : zone)}
            >
              {/* Pulse animation for high risk */}
              {(zone.riskLevel === 'critical' || zone.riskLevel === 'high') && (
                <div 
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ 
                    backgroundColor: getRiskLevelColor(zone.riskLevel),
                    opacity: 0.3,
                    width: '48px',
                    height: '48px',
                  }}
                />
              )}
              
              {/* Marker */}
              <div 
                className="relative w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg hover:scale-110 transition-transform"
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
              <AnimatePresence>
                {selectedZone?.id === zone.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-20"
                  >
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-xl min-w-[200px]">
                      <p className="font-semibold text-sm text-foreground">{zone.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {zone.incidents} incidents • {zone.violations} violations
                      </p>
                      <Badge variant={
                        zone.riskLevel === 'critical' ? 'riskCritical' :
                        zone.riskLevel === 'high' ? 'riskHigh' :
                        zone.riskLevel === 'medium' ? 'riskMedium' : 'riskLow'
                      } className="mt-2">
                        {zone.riskLevel} risk
                      </Badge>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* User location indicator */}
        {userLocation && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute pointer-events-none"
            style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="relative">
              <div className="absolute inset-0 w-8 h-8 rounded-full bg-primary animate-ping opacity-30" />
              <div className="w-8 h-8 rounded-full bg-primary border-3 border-white shadow-lg flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Camera markers */}
        {trafficCameras.slice(0, 3).map((camera, index) => {
          const positions = [
            { left: '20%', top: '40%' },
            { left: '70%', top: '35%' },
            { left: '45%', top: '70%' },
          ];
          const pos = positions[index];
          
          return (
            <motion.div
              key={camera.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="absolute pointer-events-auto"
              style={{ left: pos.left, top: pos.top }}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                camera.status === 'active' ? 'bg-success/20 border border-success/50' : 'bg-warning/20 border border-warning/50'
              }`}>
                <Camera className={`w-4 h-4 ${camera.status === 'active' ? 'text-success' : 'text-warning'}`} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Location Button */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Button
          variant="glass"
          size="sm"
          onClick={handleLocateUser}
          disabled={isLocating}
          className="shadow-lg"
        >
          {isLocating ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span className="ml-2">{userLocation ? 'Update Location' : 'Share Location'}</span>
        </Button>
      </div>

      {/* Location Error */}
      {locationError && (
        <div className="absolute top-4 left-4 right-20 z-10">
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="p-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-xs text-destructive">{locationError}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Safety Suggestions Panel */}
      <AnimatePresence>
        {userLocation && safetySuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 max-w-md z-10"
          >
            <Card className="bg-card/95 backdrop-blur-lg border-primary/20 shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">AI Safety Analysis</h4>
                      <p className="text-xs text-muted-foreground">Based on your location</p>
                    </div>
                  </div>
                  <Badge variant={
                    safetySuggestions.overallRisk === 'critical' ? 'riskCritical' :
                    safetySuggestions.overallRisk === 'high' ? 'riskHigh' :
                    safetySuggestions.overallRisk === 'medium' ? 'riskMedium' : 'riskLow'
                  }>
                    Risk: {safetySuggestions.riskScore}
                  </Badge>
                </div>

                {/* Warnings */}
                {safetySuggestions.warnings.length > 0 && (
                  <div className="mb-3 space-y-1">
                    {safetySuggestions.warnings.map((warning, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0 mt-0.5" />
                        <span className="text-warning">{warning}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recommendations */}
                <div className="space-y-1">
                  {safetySuggestions.recommendations.slice(0, 3).map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <Shield className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{rec}</span>
                    </div>
                  ))}
                </div>

                {/* Nearby Dangerous Intersections */}
                {safetySuggestions.dangerousIntersections.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Nearby Risk Zones
                    </p>
                    <div className="space-y-1">
                      {safetySuggestions.dangerousIntersections.slice(0, 2).map(zone => (
                        <div key={zone.id} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{zone.name}</span>
                          <Badge variant={zone.riskLevel === 'critical' ? 'riskCritical' : 'riskHigh'} className="text-[10px] px-1.5 py-0">
                            {zone.riskLevel}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute left-4 top-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg z-10">
        <p className="text-xs font-semibold text-foreground mb-2">Map Legend</p>
        <div className="space-y-1.5 text-[10px]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-muted-foreground">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">High/Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <Camera className="w-3 h-3 text-success" />
            <span className="text-muted-foreground">Camera</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Your Location</span>
          </div>
        </div>
      </div>
    </div>
  );
}
