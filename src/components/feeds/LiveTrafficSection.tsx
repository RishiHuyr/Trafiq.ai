import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Cpu, Shield, Info } from 'lucide-react';
import SimulatedTrafficFeed from './SimulatedTrafficFeed';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const trafficFeeds = [
  {
    id: 'CAM-LONDON-001',
    name: 'London Street Patrol',
    location: 'Central London, UK',
    videoSrc: '/videos/traffic-london.mp4'
  },
  {
    id: 'CAM-CANADA-002',
    name: 'Canada Winter Traffic',
    location: 'Toronto, Canada',
    videoSrc: '/videos/traffic-canada.mp4'
  },
  {
    id: 'CAM-NYC-003',
    name: 'Times Square Monitor',
    location: 'New York City, USA',
    videoSrc: '/videos/traffic-times-square.mp4'
  },
  {
    id: 'CAM-INT-004',
    name: 'Intersection Control',
    location: 'Traffic Signal Junction',
    videoSrc: '/videos/traffic-intersection.mp4'
  }
];

export default function LiveTrafficSection() {
  const [activeFeedId, setActiveFeedId] = useState(trafficFeeds[0]?.id ?? null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
            <Video className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-bold text-foreground">
                Live Traffic Feed
              </h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-muted/50 text-muted-foreground border-border">
                      <Info className="w-3 h-3 mr-1" />
                      SIMULATED
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Demo mode with sample traffic footage</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">
              Car-only detection with grounded bounding boxes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-success/10 text-success border-success/20 px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse mr-2" />
            4 Feeds Active
          </Badge>
          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
            <Cpu className="w-3.5 h-3.5 mr-1.5" />
            AI Processing
          </Badge>
        </div>
      </div>

      {/* Detection Legend */}
      <Card className="bg-muted/30 border-border">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Detection Status:
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border-2 border-primary" />
              <span className="text-xs text-muted-foreground">Car (high confidence)</span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <span className="text-[11px] text-muted-foreground">
              Boxes are filtered to the road region and stabilized across frames
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Video Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trafficFeeds.map((feed, index) => (
          <motion.div
            key={feed.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.1 }}
          >
            <SimulatedTrafficFeed
              videoSrc={feed.videoSrc}
              cameraId={feed.id}
              cameraName={feed.name}
              location={feed.location}
              aiEnabled={activeFeedId === feed.id}
              isActive={activeFeedId === feed.id}
              onActivate={() => setActiveFeedId(feed.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            This is a demonstration using sample traffic footage. In production, feeds connect to actual traffic cameras.
          </span>
        </p>
      </div>
    </motion.div>
  );
}
