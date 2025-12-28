import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  Play, 
  Pause, 
  Maximize2, 
  Settings, 
  Car,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  Grid3X3,
  LayoutGrid,
  Eye
} from 'lucide-react';
import { cameraFeeds } from '@/lib/mockData';
import { useState } from 'react';

export default function LiveFeedsPage() {
  const [layout, setLayout] = useState<'grid' | 'featured'>('grid');
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null);

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
              Live Camera Feeds
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time monitoring with AI-powered detection overlays
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button 
                variant={layout === 'grid' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setLayout('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button 
                variant={layout === 'featured' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setLayout('featured')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh All
            </Button>
            <Button variant="glow" size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Add Camera
            </Button>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">
                  {cameraFeeds.filter(c => c.status === 'online').length}
                </p>
                <p className="text-xs text-muted-foreground">Cameras Online</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">
                  {cameraFeeds.filter(c => c.status === 'processing').length}
                </p>
                <p className="text-xs text-muted-foreground">Processing</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {cameraFeeds.reduce((acc, c) => acc + c.vehicleCount, 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Vehicles Tracked</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">
                  {cameraFeeds.reduce((acc, c) => acc + c.violations, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Violations Detected</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Camera Grid */}
        <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 lg:grid-cols-3'}`}>
          {cameraFeeds.map((camera, index) => (
            <motion.div
              key={camera.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className={layout === 'featured' && index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}
            >
              <Card className={`overflow-hidden group ${selectedFeed === camera.id ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-0">
                  {/* Video Feed Simulation */}
                  <div 
                    className={`relative bg-gradient-to-br from-background via-muted to-background ${
                      layout === 'featured' && index === 0 ? 'h-[400px]' : 'h-[220px]'
                    }`}
                  >
                    {/* Simulated camera view */}
                    <div className="absolute inset-0">
                      {/* Road simulation */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-muted-foreground/10 to-transparent" />
                      
                      {/* Detection boxes simulation */}
                      <div className="absolute inset-0 p-4">
                        {Array.from({ length: Math.min(camera.vehicleCount % 5 + 2, 4) }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 + i * 0.2, duration: 0.3 }}
                            className="absolute border-2 border-primary rounded"
                            style={{
                              left: `${20 + i * 15 + Math.random() * 10}%`,
                              top: `${30 + Math.random() * 30}%`,
                              width: `${15 + Math.random() * 10}%`,
                              height: `${20 + Math.random() * 15}%`,
                            }}
                          >
                            <span className="absolute -top-5 left-0 text-[10px] bg-primary text-primary-foreground px-1 rounded">
                              Vehicle {i + 1}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Scan line animation */}
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge variant={
                        camera.status === 'online' ? 'online' :
                        camera.status === 'processing' ? 'processing' : 'offline'
                      }>
                        {camera.status === 'online' && <Wifi className="w-3 h-3 mr-1" />}
                        {camera.status === 'offline' && <WifiOff className="w-3 h-3 mr-1" />}
                        {camera.status === 'processing' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                        {camera.status}
                      </Badge>
                    </div>

                    {/* Camera Name */}
                    <div className="absolute top-3 right-3">
                      <span className="text-xs font-mono bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-foreground">
                        {camera.name}
                      </span>
                    </div>

                    {/* Live indicator */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-destructive/90 px-2 py-1 rounded text-xs text-destructive-foreground">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        LIVE
                      </div>
                    </div>

                    {/* Controls overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-2">
                      <Button variant="glass" size="sm">
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button variant="glass" size="sm">
                        <Pause className="w-4 h-4" />
                      </Button>
                      <Button variant="glass" size="sm">
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                      <Button variant="glass" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Camera Info */}
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-foreground">{camera.location}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Car className="w-3 h-3" />
                            {camera.vehicleCount} vehicles
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {camera.violations} violations
                          </span>
                        </div>
                      </div>
                      <Badge variant={
                        camera.riskLevel === 'high' ? 'riskHigh' :
                        camera.riskLevel === 'medium' ? 'riskMedium' : 'riskLow'
                      }>
                        {camera.riskLevel}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
