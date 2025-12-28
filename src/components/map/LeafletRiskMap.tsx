import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Camera, Layers, Locate, MapPin, Plus, Minus, Shield, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { riskZones } from "@/lib/mockData";

interface UserLocation {
  lat: number;
  lng: number;
}

const riskColorToken = (riskLevel: string) => {
  switch (riskLevel) {
    case "critical":
    case "high":
      return "--destructive";
    case "medium":
      return "--warning";
    default:
      return "--success";
  }
};

const hslVar = (token: string, alpha?: number) =>
  alpha == null ? `hsl(var(${token}))` : `hsl(var(${token}) / ${alpha})`;

const createRiskIcon = (riskLevel: string, riskScore: number) => {
  const token = riskColorToken(riskLevel);
  const color = hslVar(token);
  const bg = hslVar(token, 0.14);
  const glow = hslVar(token, 0.45);

  return L.divIcon({
    className: "leaflet-risk-marker",
    html: `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 9999px;
        background: ${bg};
        border: 3px solid ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 12px;
        color: ${color};
        box-shadow: 0 0 18px ${glow};
        position: relative;
        backdrop-filter: blur(10px);
      ">
        ${riskScore}
        ${
          riskLevel === "critical" || riskLevel === "high"
            ? `
          <div style="
            position: absolute;
            inset: -5px;
            border-radius: 9999px;
            border: 2px solid ${color};
            animation: leafPing 1.6s cubic-bezier(0,0,0.2,1) infinite;
            opacity: 0.6;
          "></div>
        `
            : ""
        }
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -18],
  });
};

const cameraIcon = () => {
  const color = hslVar("--success");
  const bg = hslVar("--success", 0.14);
  const border = hslVar("--success", 0.55);

  return L.divIcon({
    className: "leaflet-camera-marker",
    html: `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 10px;
        background: ${bg};
        border: 2px solid ${border};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 24px hsl(var(--foreground) / 0.15);
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const userLocationIcon = () => {
  const color = hslVar("--primary");
  const ping = hslVar("--primary", 0.22);

  return L.divIcon({
    className: "leaflet-user-marker",
    html: `
      <div style="position: relative;">
        <div style="
          position: absolute;
          inset: -10px;
          border-radius: 9999px;
          background: ${ping};
          animation: leafPing 2.2s cubic-bezier(0,0,0.2,1) infinite;
        "></div>
        <div style="
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          background: ${color};
          border: 4px solid hsl(var(--background));
          box-shadow: 0 12px 28px hsl(var(--foreground) / 0.25);
        "></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

// Mock camera locations
const trafficCameras = [
  { id: "cam-1", lat: 40.7128, lng: -74.006, name: "Downtown Cam A", status: "active" },
  { id: "cam-2", lat: 40.7189, lng: -74.002, name: "Main St Cam", status: "active" },
  { id: "cam-3", lat: 40.7082, lng: -74.012, name: "Bridge Cam", status: "active" },
  { id: "cam-4", lat: 40.725, lng: -73.998, name: "Highway Cam", status: "maintenance" },
];

export default function LeafletRiskMap() {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const riskMarkersRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);
  const cameraLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const isEmbeddedPreview = useMemo(() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }, []);

  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.006]);
  const [mapZoom, setMapZoom] = useState(14);

  // Init map once
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;

    const map = L.map(mapElRef.current, {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
      zoomSnap: 0.5,
    }).setView(mapCenter, mapZoom);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© CARTO © OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    riskMarkersRef.current = L.layerGroup().addTo(map);
    heatLayerRef.current = L.layerGroup().addTo(map);
    cameraLayerRef.current = L.layerGroup().addTo(map);

    map.on("moveend", () => {
      const c = map.getCenter();
      setMapCenter([c.lat, c.lng]);
      setMapZoom(map.getZoom());
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Note: we intentionally do NOT mirror React state back into map.setView()
  // because Leaflet emits move events that would cause a render loop.
  // We only move the map programmatically (e.g. on "My Location").

  // Render risk markers
  useEffect(() => {
    const group = riskMarkersRef.current;
    if (!group) return;

    group.clearLayers();

    for (const zone of riskZones) {
      const marker = L.marker([zone.lat, zone.lng], {
        icon: createRiskIcon(zone.riskLevel, zone.riskScore),
        keyboard: false,
      });

      const token = riskColorToken(zone.riskLevel);
      const badgeBg = hslVar(token, 0.14);
      const badgeFg = hslVar(token);

      marker.bindPopup(
        `
        <div class="leaflet-popup-ui">
          <div class="leaflet-popup-title">${zone.name}</div>
          <div class="leaflet-popup-sub">${zone.incidents} incidents • ${zone.violations} violations</div>
          <div class="leaflet-popup-sub">Peak: ${zone.peakHours}</div>
          <div style="display:inline-flex;margin-top:10px;padding:4px 8px;border-radius:9999px;background:${badgeBg};color:${badgeFg};font-weight:700;font-size:10px;letter-spacing:0.08em;">
            ${zone.riskLevel.toUpperCase()} RISK
          </div>
        </div>
        `,
        { closeButton: false }
      );

      marker.addTo(group);
    }
  }, []);

  // Render cameras
  useEffect(() => {
    const group = cameraLayerRef.current;
    if (!group) return;

    group.clearLayers();
    const icon = cameraIcon();

    for (const cam of trafficCameras) {
      const marker = L.marker([cam.lat, cam.lng], { icon, keyboard: false });
      marker.bindPopup(
        `
        <div class="leaflet-popup-ui">
          <div class="leaflet-popup-title">${cam.name}</div>
          <div class="leaflet-popup-sub"><span style="color:${hslVar("--success")}">●</span> ${cam.status}</div>
        </div>
        `,
        { closeButton: false }
      );
      marker.addTo(group);
    }
  }, []);

  // Render heatmap circles
  useEffect(() => {
    const group = heatLayerRef.current;
    if (!group) return;

    group.clearLayers();
    if (!showHeatmap) return;

    for (const zone of riskZones) {
      const token = riskColorToken(zone.riskLevel);
      L.circle([zone.lat, zone.lng], {
        radius: zone.riskScore * 18,
        color: hslVar(token, 0.7),
        weight: 1,
        opacity: 0.6,
        fillColor: hslVar(token, 0.25),
        fillOpacity: 0.25,
      }).addTo(group);
    }
  }, [showHeatmap]);

  // Update user marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!userLocation) {
      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
        userMarkerRef.current = null;
      }
      return;
    }

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userLocationIcon(),
        keyboard: false,
      }).addTo(map);
      userMarkerRef.current.bindPopup(
        `
        <div class="leaflet-popup-ui">
          <div class="leaflet-popup-title">Your Location</div>
          <div class="leaflet-popup-sub">${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}</div>
        </div>
        `,
        { closeButton: false }
      );
    } else {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  const handleLocateUser = useCallback(() => {
    setIsLocating(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    // In some embedded/preview iframes, browsers block geolocation.
    if (isEmbeddedPreview) {
      setLocationError(
        "Location is blocked in embedded preview. Open the app in a new tab / published URL, then tap 'My Location' again."
      );
      setIsLocating(false);
      return;
    }

    if (!window.isSecureContext) {
      setLocationError("Location requires HTTPS. Please open the app on HTTPS and try again.");
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
        setMapZoom(16);

        // Move the map directly (avoid React ↔ Leaflet feedback loop)
        mapRef.current?.flyTo([newLocation.lat, newLocation.lng], 16, { animate: true, duration: 0.8 });

        setIsLocating(false);
      },
      (error) => {
        if (error.code === 1) {
          setLocationError(
            "Location permission denied. Please allow location access in your browser settings, then try again."
          );
        } else if (error.code === 2) {
          setLocationError("Location unavailable. Please check GPS/network and try again.");
        } else if (error.code === 3) {
          setLocationError("Location request timed out. Please try again.");
        } else {
          setLocationError(`Unable to retrieve location: ${error.message}`);
        }
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, [isEmbeddedPreview]);

  const safetySuggestions = useMemo(() => {
    if (!userLocation) return null;

    const nearbyZones = riskZones.filter((zone) => {
      const distance = Math.sqrt(
        Math.pow(zone.lat - userLocation.lat, 2) + Math.pow(zone.lng - userLocation.lng, 2)
      );
      return distance < 0.02;
    });

    const highestRisk = [...nearbyZones].sort((a, b) => b.riskScore - a.riskScore)[0];
    const hour = new Date().getHours();
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    const isNight = hour >= 21 || hour <= 5;

    return {
      overallRisk: highestRisk?.riskLevel || "low",
      riskScore: highestRisk?.riskScore || 15,
      warnings: [
        ...(isRushHour ? ["Rush hour traffic - expect delays and increased violation risk"] : []),
        ...(isNight ? ["Reduced visibility - maintain safe following distance"] : []),
        ...(highestRisk?.riskLevel === "critical" ? [`Critical zone ahead: ${highestRisk.name}`] : []),
        ...(highestRisk?.riskLevel === "high" ? [`High-risk area nearby: ${highestRisk.name}`] : []),
      ],
      recommendations: [
        "Stay alert at intersections - 60% of accidents occur here",
        ...(nearbyZones.length > 2 ? ["Multiple risk zones in area - reduce speed"] : []),
        ...(isRushHour ? ["Consider alternate route to avoid congestion"] : []),
        "Report any hazards to help protect other drivers",
      ],
      dangerousIntersections: nearbyZones.filter((z) => z.riskLevel === "high" || z.riskLevel === "critical"),
    };
  }, [userLocation]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      {/* Map canvas */}
      <div ref={mapElRef} className="absolute inset-0 h-full w-full" aria-label="Live risk map" />

      {/* Zoom controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-1 pointer-events-auto">
        <Button
          variant="glass"
          size="icon"
          className="h-10 w-10 rounded-lg shadow-lg"
          onClick={() => mapRef.current?.zoomIn()}
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="glass"
          size="icon"
          className="h-10 w-10 rounded-lg shadow-lg"
          onClick={() => mapRef.current?.zoomOut()}
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      {/* Top controls */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex items-start justify-between pointer-events-none">
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
              <div className="w-3 h-3 rounded-full bg-success shadow-[0_0_12px_hsl(var(--success)/0.45)]" />
              <span className="text-muted-foreground">Low Risk Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning shadow-[0_0_12px_hsl(var(--warning)/0.45)]" />
              <span className="text-muted-foreground">Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive shadow-[0_0_12px_hsl(var(--destructive)/0.45)]" />
              <span className="text-muted-foreground">High/Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <Camera className="w-3 h-3 text-success" />
              <span className="text-muted-foreground">Traffic Camera</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.45)]" />
              <span className="text-muted-foreground">Your Location</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-border/50">
            <button
              onClick={() => setShowHeatmap((v) => !v)}
              className={`flex items-center gap-2 text-[11px] transition-colors ${showHeatmap ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`w-3 h-3 rounded border flex items-center justify-center ${
                  showHeatmap ? "bg-primary border-primary" : "border-muted-foreground"
                }`}
              >
                {showHeatmap && <span className="text-[8px] text-primary-foreground">✓</span>}
              </div>
              Show Heatmap
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="pointer-events-auto">
          <div className="flex flex-col items-end">
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
              <span className="ml-2">{userLocation ? "Update" : "My Location"}</span>
            </Button>
            {isEmbeddedPreview && (
              <p className="mt-1 text-[10px] text-muted-foreground/80 max-w-[220px] text-right">
                Preview may block GPS. Open in new tab for live location.
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Location error */}
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

      {/* AI panel */}
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
                    <div className="text-2xl font-bold text-foreground">{safetySuggestions.riskScore}</div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk Score</p>
                  </div>
                </div>

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

                <div className="space-y-1">
                  {safetySuggestions.recommendations.slice(0, 3).map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <Shield className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{rec}</span>
                    </div>
                  ))}
                </div>

                {safetySuggestions.dangerousIntersections.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-destructive" />
                      Nearby High-Risk Zones
                    </p>
                    <div className="space-y-1">
                      {safetySuggestions.dangerousIntersections.slice(0, 2).map((zone) => (
                        <div key={zone.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/30">
                          <span className="text-muted-foreground">{zone.name}</span>
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={{
                              background: hslVar(riskColorToken(zone.riskLevel), 0.14),
                              color: hslVar(riskColorToken(zone.riskLevel)),
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

      <div className="absolute bottom-2 right-2 z-[1000] text-[9px] text-muted-foreground/50 pointer-events-none">
        © CARTO • OpenStreetMap
      </div>
    </div>
  );
}
