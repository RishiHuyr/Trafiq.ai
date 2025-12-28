import { useCallback, useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Camera, MapPin, Navigation, Shield, Zap, Locate, Layers, Plus, Minus } from 'lucide-react';
import { riskZones, getRiskLevelColor } from '@/lib/mockData';

interface UserLocation {
  lat: number;
  lng: number;
}

// Custom marker icons
const createRiskIcon = (riskLevel: string, riskScore: number) => {
  const color = riskLevel === 'critical' ? '#ef4444' : 
                riskLevel === 'high' ? '#f97316' : 
                riskLevel === 'medium' ? '#eab308' : '#22c55e';
  
  return L.divIcon({
    className: 'custom-risk-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${color}22;
        border: 3px solid ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
        color: ${color};
        box-shadow: 0 0 20px ${color}60;
        position: relative;
      ">
        ${riskScore}
        ${(riskLevel === 'critical' || riskLevel === 'high') ? `
          <div style="
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            border: 2px solid ${color};
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            opacity: 0.5;
          "></div>
        ` : ''}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

const cameraIcon = L.divIcon({
  className: 'custom-camera-marker',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(34, 197, 94, 0.2);
      border: 2px solid rgba(34, 197, 94, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="position: relative;">
      <div style="
        position: absolute;
        inset: -8px;
        border-radius: 50%;
        background: rgba(59, 130, 246, 0.3);
        animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
      "></div>
      <div style="
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #3b82f6;
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Mock camera locations
const trafficCameras = [
  { id: 'cam-1', lat: 40.7128, lng: -74.006, name: 'Downtown Cam A', status: 'active' },
  { id: 'cam-2', lat: 40.7189, lng: -74.002, name: 'Main St Cam', status: 'active' },
  { id: 'cam-3', lat: 40.7082, lng: -74.012, name: 'Bridge Cam', status: 'active' },
  { id: 'cam-4', lat: 40.7250, lng: -73.998, name: 'Highway Cam', status: 'maintenance' },
];

// Map controller component for programmatic control
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

// Zoom controls component
function ZoomControls() {
  const map = useMap();
  
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-1">
      <Button
        variant="glass"
        size="icon"
        className="h-10 w-10 rounded-lg shadow-lg"
        onClick={() => map.zoomIn()}
      >
        <Plus className="w-4 h-4" />
      </Button>
      <Button
        variant="glass"
        size="icon"
        className="h-10 w-10 rounded-lg shadow-lg"
        onClick={() => map.zoomOut()}
      >
        <Minus className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function LeafletRiskMap() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.006]);
  const [mapZoom, setMapZoom] = useState(14);
  const [showHeatmap, setShowHeatmap] = useState(true);

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
        setMapCenter([newLocation.lat, newLocation.lng]);
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

    const nearbyZones = riskZones.filter(zone => {
      const distance = Math.sqrt(
        Math.pow(zone.lat - userLocation.lat, 2) + 
        Math.pow(zone.lng - userLocation.lng, 2)
      );
      return distance < 0.02;
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

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      {/* Leaflet Map */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full z-0"
        zoomControl={false}
        attributionControl={false}
        style={{ background: '#0a0a0f' }}
      >
        {/* Dark themed map tiles */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        
        <MapController center={mapCenter} zoom={mapZoom} />
        <ZoomControls />

        {/* Risk Zone Circles (Heatmap effect) */}
        {showHeatmap && riskZones.map(zone => (
          <Circle
            key={`heatmap-${zone.id}`}
            center={[zone.lat, zone.lng]}
            radius={zone.riskScore * 15}
            pathOptions={{
              color: getRiskLevelColor(zone.riskLevel),
              fillColor: getRiskLevelColor(zone.riskLevel),
              fillOpacity: 0.2,
              weight: 1,
              opacity: 0.5,
            }}
          />
        ))}

        {/* Risk Zone Markers */}
        {riskZones.map(zone => (
          <Marker
            key={zone.id}
            position={[zone.lat, zone.lng]}
            icon={createRiskIcon(zone.riskLevel, zone.riskScore)}
          >
            <Popup className="risk-popup">
              <div className="bg-popover p-3 rounded-lg min-w-[180px]">
                <h4 className="font-semibold text-sm text-foreground">{zone.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {zone.incidents} incidents • {zone.violations} violations
                </p>
                <p className="text-xs text-muted-foreground">
                  Peak: {zone.peakHours}
                </p>
                <div className="mt-2 inline-flex px-2 py-0.5 rounded text-xs font-medium" style={{
                  background: `${getRiskLevelColor(zone.riskLevel)}20`,
                  color: getRiskLevelColor(zone.riskLevel)
                }}>
                  {zone.riskLevel.toUpperCase()} RISK
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Camera Markers */}
        {trafficCameras.map(camera => (
          <Marker
            key={camera.id}
            position={[camera.lat, camera.lng]}
            icon={cameraIcon}
          >
            <Popup>
              <div className="bg-popover p-2 rounded-lg">
                <p className="font-medium text-sm text-foreground">{camera.name}</p>
                <p className="text-xs text-success">● {camera.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="bg-popover p-2 rounded-lg">
                <p className="font-medium text-sm text-foreground">Your Location</p>
                <p className="text-xs text-muted-foreground">
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-start justify-between pointer-events-none">
        {/* Legend */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-xl p-3 shadow-2xl pointer-events-auto"
        >
          <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
            <Layers className="w-3 h-3 text-primary" />
            Map Legend
          </p>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-muted-foreground">Low Risk Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
              <span className="text-muted-foreground">Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <span className="text-muted-foreground">High/Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <Camera className="w-3 h-3 text-success" />
              <span className="text-muted-foreground">Traffic Camera</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span className="text-muted-foreground">Your Location</span>
            </div>
          </div>
          
          {/* Heatmap Toggle */}
          <div className="mt-3 pt-2 border-t border-border/50">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center gap-2 text-[11px] transition-colors ${showHeatmap ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <div className={`w-3 h-3 rounded border ${showHeatmap ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                {showHeatmap && <span className="text-[8px] text-white flex items-center justify-center">✓</span>}
              </div>
              Show Heatmap
            </button>
          </div>
        </motion.div>

        {/* Location Button */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="pointer-events-auto"
        >
          <Button
            variant="glass"
            size="sm"
            onClick={handleLocateUser}
            disabled={isLocating}
            className="shadow-xl bg-card/90 backdrop-blur-xl border-border/50"
          >
            {isLocating ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Locate className="w-4 h-4" />
            )}
            <span className="ml-2">{userLocation ? 'Update' : 'My Location'}</span>
          </Button>
        </motion.div>
      </div>

      {/* Location Error */}
      <AnimatePresence>
        {locationError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-4 right-4 z-[1000]"
          >
            <Card className="bg-destructive/10 border-destructive/30 backdrop-blur-xl">
              <CardContent className="p-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                <p className="text-xs text-destructive">{locationError}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Safety Suggestions Panel */}
      <AnimatePresence>
        {userLocation && safetySuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 max-w-md z-[1000]"
          >
            <Card className="bg-card/95 backdrop-blur-xl border-primary/30 shadow-2xl shadow-primary/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/30">
                      <Zap className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">AI Safety Analysis</h4>
                      <p className="text-[10px] text-muted-foreground">Real-time risk assessment</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" style={{ color: getRiskLevelColor(safetySuggestions.overallRisk) }}>
                      {safetySuggestions.riskScore}
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk Score</p>
                  </div>
                </div>

                {/* Warnings */}
                {safetySuggestions.warnings.length > 0 && (
                  <div className="mb-3 p-2 rounded-lg bg-warning/10 border border-warning/20 space-y-1">
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
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-destructive" />
                      Nearby High-Risk Zones
                    </p>
                    <div className="space-y-1">
                      {safetySuggestions.dangerousIntersections.slice(0, 2).map(zone => (
                        <div key={zone.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/30">
                          <span className="text-muted-foreground">{zone.name}</span>
                          <span 
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={{ 
                              background: `${getRiskLevelColor(zone.riskLevel)}20`,
                              color: getRiskLevelColor(zone.riskLevel)
                            }}
                          >
                            {zone.riskLevel.toUpperCase()}
                          </span>
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

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 z-[1000] text-[9px] text-muted-foreground/50">
        © CARTO • OpenStreetMap
      </div>

      {/* CSS for Leaflet customization */}
      <style>{`
        .leaflet-container {
          background: #0a0a0f !important;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-popup-tip {
          display: none !important;
        }
        .custom-risk-marker, .custom-camera-marker, .user-location-marker {
          background: transparent !important;
          border: none !important;
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.8; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
