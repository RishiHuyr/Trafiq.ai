import { useCallback, useState, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle, HeatmapLayer, InfoWindow } from '@react-google-maps/api';
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

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#374151' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2d3748' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c4a6e' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1a202c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1a202c' }] },
];

// Mock camera locations
const trafficCameras = [
  { id: 'cam-1', lat: 40.7128, lng: -74.006, name: 'Downtown Cam A', status: 'active' },
  { id: 'cam-2', lat: 40.7189, lng: -74.002, name: 'Main St Cam', status: 'active' },
  { id: 'cam-3', lat: 40.7082, lng: -74.012, name: 'Bridge Cam', status: 'active' },
  { id: 'cam-4', lat: 40.7250, lng: -73.998, name: 'Highway Cam', status: 'maintenance' },
];

// Mock accident hotspots
const accidentHotspots = [
  { id: 'hot-1', lat: 40.7145, lng: -74.008, count: 23, severity: 'high' },
  { id: 'hot-2', lat: 40.7200, lng: -73.995, count: 15, severity: 'medium' },
  { id: 'hot-3', lat: 40.7065, lng: -74.015, count: 31, severity: 'critical' },
];

export default function GoogleMapRisk({ apiKey }: GoogleMapRiskProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedZone, setSelectedZone] = useState<typeof riskZones[0] | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<typeof trafficCameras[0] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['visualization'],
  });

  const defaultCenter = useMemo(() => ({ lat: 40.7128, lng: -74.006 }), []);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

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
        
        if (map) {
          map.panTo(newLocation);
          map.setZoom(15);
        }
      },
      (error) => {
        setLocationError(`Unable to retrieve location: ${error.message}`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [map]);

  // Generate heatmap data for high-risk areas
  const heatmapData = useMemo(() => {
    if (!isLoaded || !window.google) return [];
    
    const data: google.maps.LatLng[] = [];
    
    riskZones.forEach(zone => {
      const weight = zone.riskScore / 20;
      for (let i = 0; i < weight; i++) {
        data.push(new google.maps.LatLng(
          zone.lat + (Math.random() - 0.5) * 0.01,
          zone.lng + (Math.random() - 0.5) * 0.01
        ));
      }
    });
    
    accidentHotspots.forEach(spot => {
      const weight = spot.count / 5;
      for (let i = 0; i < weight; i++) {
        data.push(new google.maps.LatLng(
          spot.lat + (Math.random() - 0.5) * 0.005,
          spot.lng + (Math.random() - 0.5) * 0.005
        ));
      }
    });
    
    return data;
  }, [isLoaded]);

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

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-card rounded-lg border border-border">
        <div className="text-center p-8">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium">Failed to load Google Maps</p>
          <p className="text-muted-foreground text-sm mt-2">Please check your API key and try again</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-card rounded-lg border border-border">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={userLocation || defaultCenter}
        zoom={13}
        onLoad={onMapLoad}
        options={{
          styles: darkMapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {/* Heatmap Layer */}
        {heatmapData.length > 0 && (
          <HeatmapLayer
            data={heatmapData}
            options={{
              radius: 40,
              opacity: 0.6,
              gradient: [
                'rgba(0, 255, 0, 0)',
                'rgba(0, 255, 0, 0.5)',
                'rgba(255, 255, 0, 0.7)',
                'rgba(255, 165, 0, 0.8)',
                'rgba(255, 0, 0, 1)',
              ],
            }}
          />
        )}

        {/* Risk Zone Circles */}
        {riskZones.map(zone => (
          <Circle
            key={zone.id}
            center={{ lat: zone.lat, lng: zone.lng }}
            radius={500}
            options={{
              fillColor: getRiskLevelColor(zone.riskLevel),
              fillOpacity: 0.15,
              strokeColor: getRiskLevelColor(zone.riskLevel),
              strokeOpacity: 0.5,
              strokeWeight: 2,
              clickable: true,
            }}
            onClick={() => setSelectedZone(zone)}
          />
        ))}

        {/* Risk Zone Markers */}
        {riskZones.map(zone => (
          <Marker
            key={`marker-${zone.id}`}
            position={{ lat: zone.lat, lng: zone.lng }}
            onClick={() => setSelectedZone(zone)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: getRiskLevelColor(zone.riskLevel),
              fillOpacity: 0.9,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
          />
        ))}

        {/* Camera Markers */}
        {trafficCameras.map(camera => (
          <Marker
            key={camera.id}
            position={{ lat: camera.lat, lng: camera.lng }}
            onClick={() => setSelectedCamera(camera)}
            icon={{
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
              fillColor: camera.status === 'active' ? 'hsl(152, 76%, 40%)' : 'hsl(38, 92%, 50%)',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 1,
              scale: 1.5,
              anchor: new google.maps.Point(12, 22),
            }}
          />
        ))}

        {/* User Location Marker */}
        {userLocation && (
          <>
            <Circle
              center={userLocation}
              radius={100}
              options={{
                fillColor: 'hsl(168, 100%, 45%)',
                fillOpacity: 0.2,
                strokeColor: 'hsl(168, 100%, 45%)',
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
            <Marker
              position={userLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: 'hsl(168, 100%, 45%)',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
              }}
            />
          </>
        )}

        {/* Selected Zone Info Window */}
        {selectedZone && (
          <InfoWindow
            position={{ lat: selectedZone.lat, lng: selectedZone.lng }}
            onCloseClick={() => setSelectedZone(null)}
          >
            <div className="bg-background p-3 rounded-lg min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-foreground text-sm">{selectedZone.name}</h3>
                <Badge variant={
                  selectedZone.riskLevel === 'critical' ? 'riskCritical' :
                  selectedZone.riskLevel === 'high' ? 'riskHigh' :
                  selectedZone.riskLevel === 'medium' ? 'riskMedium' : 'riskLow'
                }>
                  {selectedZone.riskScore}
                </Badge>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Incidents: {selectedZone.incidents}</p>
                <p>Violations: {selectedZone.violations}</p>
                <p>Peak: {selectedZone.peakHours}</p>
              </div>
            </div>
          </InfoWindow>
        )}

        {/* Selected Camera Info Window */}
        {selectedCamera && (
          <InfoWindow
            position={{ lat: selectedCamera.lat, lng: selectedCamera.lng }}
            onCloseClick={() => setSelectedCamera(null)}
          >
            <div className="bg-background p-3 rounded-lg min-w-[180px]">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">{selectedCamera.name}</h3>
              </div>
              <Badge variant={selectedCamera.status === 'active' ? 'online' : 'processing'}>
                {selectedCamera.status}
              </Badge>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Location Button */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
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
        <div className="absolute top-4 left-4 right-16">
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
            className="absolute bottom-4 left-4 right-4 max-w-md"
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
      <div className="absolute left-4 top-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
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
