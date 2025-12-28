import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { RiskZonesPanel } from '@/components/dashboard/RiskZonesPanel';
import { CameraFeedsPanel } from '@/components/dashboard/CameraFeedsPanel';
import { TrendsChart, WeeklyChart, RiskDistributionChart } from '@/components/dashboard/Charts';
import { RecommendationsPanel } from '@/components/dashboard/RecommendationsPanel';
import { RiskHeatmap } from '@/components/dashboard/RiskHeatmap';
import { Calendar } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Dashboard() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Command Center
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              {today}
            </p>
          </div>
        </motion.div>
        
        {/* Stats Grid */}
        <StatsGrid />
        
        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-12 gap-6"
        >
          {/* Left Column - Heatmap & Charts */}
          <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8 space-y-6">
            <RiskHeatmap />
            <TrendsChart />
            <CameraFeedsPanel />
          </motion.div>
          
          {/* Right Column - Alerts & Zones */}
          <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4 space-y-6">
            <AlertsPanel />
            <RiskZonesPanel />
          </motion.div>
        </motion.div>
        
        {/* Bottom Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-12 gap-6"
        >
          <motion.div variants={itemVariants} className="col-span-12 lg:col-span-8">
            <RecommendationsPanel />
          </motion.div>
          <motion.div variants={itemVariants} className="col-span-12 lg:col-span-4 space-y-6">
            <WeeklyChart />
            <RiskDistributionChart />
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
