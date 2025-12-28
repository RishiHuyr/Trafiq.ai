// TRAFIQ.AI Mock Data for Demo

export interface RiskZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  incidents: number;
  violations: number;
  trafficDensity: number;
  peakHours: string;
  recommendations: string[];
}

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  location: string;
  timestamp: Date;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface CameraFeed {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'processing';
  vehicleCount: number;
  violations: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface TrafficTrend {
  hour: string;
  accidents: number;
  violations: number;
  density: number;
  riskScore: number;
}

export interface SafetyMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

// Risk Zones Data
export const riskZones: RiskZone[] = [
  {
    id: 'zone-1',
    name: 'Downtown Intersection A',
    lat: 40.7128,
    lng: -74.006,
    riskScore: 87,
    riskLevel: 'critical',
    incidents: 23,
    violations: 156,
    trafficDensity: 92,
    peakHours: '8:00 AM - 10:00 AM',
    recommendations: [
      'Deploy additional traffic officers during peak hours',
      'Install speed-detection cameras',
      'Review signal timing patterns',
    ],
  },
  {
    id: 'zone-2',
    name: 'Highway Exit 42',
    lat: 40.7589,
    lng: -73.9851,
    riskScore: 72,
    riskLevel: 'high',
    incidents: 15,
    violations: 89,
    trafficDensity: 78,
    peakHours: '5:00 PM - 7:00 PM',
    recommendations: [
      'Improve lane markings and signage',
      'Add merge warning indicators',
      'Consider infrastructure redesign',
    ],
  },
  {
    id: 'zone-3',
    name: 'School Zone - Main St',
    lat: 40.7484,
    lng: -73.9857,
    riskScore: 65,
    riskLevel: 'high',
    incidents: 8,
    violations: 45,
    trafficDensity: 55,
    peakHours: '7:30 AM - 8:30 AM',
    recommendations: [
      'Increase speed enforcement during school hours',
      'Add crossing guard support',
      'Install pedestrian warning systems',
    ],
  },
  {
    id: 'zone-4',
    name: 'Industrial Park Junction',
    lat: 40.7282,
    lng: -73.7949,
    riskScore: 48,
    riskLevel: 'medium',
    incidents: 5,
    violations: 32,
    trafficDensity: 45,
    peakHours: '6:00 AM - 7:00 AM',
    recommendations: [
      'Monitor heavy vehicle compliance',
      'Review road surface conditions',
    ],
  },
  {
    id: 'zone-5',
    name: 'Residential Area - Oak Ave',
    lat: 40.7614,
    lng: -73.9776,
    riskScore: 28,
    riskLevel: 'low',
    incidents: 2,
    violations: 12,
    trafficDensity: 25,
    peakHours: '9:00 AM - 10:00 AM',
    recommendations: [
      'Maintain current safety measures',
    ],
  },
  {
    id: 'zone-6',
    name: 'Bridge Entrance - West',
    lat: 40.7061,
    lng: -74.0088,
    riskScore: 78,
    riskLevel: 'high',
    incidents: 18,
    violations: 98,
    trafficDensity: 88,
    peakHours: '8:30 AM - 9:30 AM',
    recommendations: [
      'Implement variable speed limits',
      'Add real-time congestion alerts',
      'Deploy predictive traffic management',
    ],
  },
];

// Active Alerts
export const alerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'danger',
    title: 'High-Risk Pattern Detected',
    location: 'Downtown Intersection A',
    timestamp: new Date(Date.now() - 5 * 60000),
    description: 'Unusual spike in traffic violations. Predicted 40% increase in accident probability.',
    priority: 'critical',
  },
  {
    id: 'alert-2',
    type: 'warning',
    title: 'Congestion Building',
    location: 'Highway Exit 42',
    timestamp: new Date(Date.now() - 15 * 60000),
    description: 'Traffic density approaching critical levels. Consider early intervention.',
    priority: 'high',
  },
  {
    id: 'alert-3',
    type: 'warning',
    title: 'School Zone Peak Hours',
    location: 'School Zone - Main St',
    timestamp: new Date(Date.now() - 30 * 60000),
    description: 'Approaching peak school hours. Enhanced monitoring recommended.',
    priority: 'medium',
  },
  {
    id: 'alert-4',
    type: 'info',
    title: 'Weather Advisory Impact',
    location: 'Bridge Entrance - West',
    timestamp: new Date(Date.now() - 45 * 60000),
    description: 'Light rain expected. Historical data suggests 15% increase in minor incidents.',
    priority: 'medium',
  },
];

// Camera Feeds
export const cameraFeeds: CameraFeed[] = [
  {
    id: 'cam-1',
    name: 'CAM-DT-001',
    location: 'Downtown Intersection A',
    status: 'online',
    vehicleCount: 234,
    violations: 12,
    riskLevel: 'high',
  },
  {
    id: 'cam-2',
    name: 'CAM-HW-042',
    location: 'Highway Exit 42',
    status: 'online',
    vehicleCount: 567,
    violations: 8,
    riskLevel: 'medium',
  },
  {
    id: 'cam-3',
    name: 'CAM-SC-003',
    location: 'School Zone - Main St',
    status: 'processing',
    vehicleCount: 89,
    violations: 3,
    riskLevel: 'medium',
  },
  {
    id: 'cam-4',
    name: 'CAM-BR-001',
    location: 'Bridge Entrance - West',
    status: 'online',
    vehicleCount: 445,
    violations: 15,
    riskLevel: 'high',
  },
];

// Hourly Traffic Trends
export const trafficTrends: TrafficTrend[] = [
  { hour: '00:00', accidents: 2, violations: 15, density: 12, riskScore: 18 },
  { hour: '02:00', accidents: 1, violations: 8, density: 8, riskScore: 12 },
  { hour: '04:00', accidents: 1, violations: 5, density: 10, riskScore: 10 },
  { hour: '06:00', accidents: 3, violations: 25, density: 45, riskScore: 35 },
  { hour: '08:00', accidents: 8, violations: 65, density: 92, riskScore: 78 },
  { hour: '10:00', accidents: 5, violations: 45, density: 75, riskScore: 55 },
  { hour: '12:00', accidents: 4, violations: 38, density: 68, riskScore: 48 },
  { hour: '14:00', accidents: 3, violations: 32, density: 62, riskScore: 42 },
  { hour: '16:00', accidents: 6, violations: 55, density: 85, riskScore: 65 },
  { hour: '18:00', accidents: 9, violations: 72, density: 95, riskScore: 82 },
  { hour: '20:00', accidents: 5, violations: 42, density: 55, riskScore: 45 },
  { hour: '22:00', accidents: 3, violations: 28, density: 32, riskScore: 28 },
];

// Weekly Trends
export const weeklyTrends = [
  { day: 'Mon', accidents: 24, violations: 312, riskScore: 62 },
  { day: 'Tue', accidents: 18, violations: 285, riskScore: 55 },
  { day: 'Wed', accidents: 22, violations: 298, riskScore: 58 },
  { day: 'Thu', accidents: 28, violations: 345, riskScore: 68 },
  { day: 'Fri', accidents: 35, violations: 412, riskScore: 75 },
  { day: 'Sat', accidents: 42, violations: 389, riskScore: 72 },
  { day: 'Sun', accidents: 15, violations: 198, riskScore: 42 },
];

// Safety Metrics
export const safetyMetrics: SafetyMetric[] = [
  { label: 'Accident Reduction', value: 23, change: -12, trend: 'down', unit: '%' },
  { label: 'Response Time', value: 4.2, change: -0.8, trend: 'down', unit: 'min' },
  { label: 'Violations Detected', value: 1247, change: 156, trend: 'up', unit: '' },
  { label: 'Zones Monitored', value: 48, change: 6, trend: 'up', unit: '' },
];

// Impact Stats
export const impactStats = {
  accidentsPreventedThisMonth: 127,
  livesProtected: 312,
  enforcementEfficiency: 89,
  predictionAccuracy: 94.2,
  coverageArea: 156,
  activeCameras: 48,
};

// Recommendations Summary
export const topRecommendations = [
  {
    id: 'rec-1',
    priority: 'critical',
    location: 'Downtown Intersection A',
    action: 'Deploy mobile enforcement unit',
    expectedImpact: '35% reduction in violations',
    timeframe: 'Immediate',
  },
  {
    id: 'rec-2',
    priority: 'high',
    location: 'Highway Exit 42',
    action: 'Install dynamic speed warning signs',
    expectedImpact: '28% reduction in accidents',
    timeframe: '2 weeks',
  },
  {
    id: 'rec-3',
    priority: 'high',
    location: 'Bridge Entrance - West',
    action: 'Implement variable speed limits during peak hours',
    expectedImpact: '22% improvement in traffic flow',
    timeframe: '1 month',
  },
  {
    id: 'rec-4',
    priority: 'medium',
    location: 'School Zone - Main St',
    action: 'Add automated pedestrian detection alerts',
    expectedImpact: '45% improvement in pedestrian safety',
    timeframe: '3 weeks',
  },
];

// Helper functions
export function getRiskLevelColor(level: string): string {
  switch (level) {
    case 'critical':
      return 'hsl(var(--risk-critical))';
    case 'high':
      return 'hsl(var(--destructive))';
    case 'medium':
      return 'hsl(var(--warning))';
    case 'low':
      return 'hsl(var(--success))';
    default:
      return 'hsl(var(--muted))';
  }
}

export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
