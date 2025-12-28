import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { trafficTrends, weeklyTrends, riskZones } from '@/lib/mockData';
import { Activity, Calendar, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

const COLORS = {
  primary: 'hsl(168, 100%, 45%)',
  warning: 'hsl(38, 92%, 50%)',
  destructive: 'hsl(0, 72%, 51%)',
  success: 'hsl(152, 76%, 40%)',
  muted: 'hsl(222, 30%, 25%)',
};

export function TrendsChart() {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          24-Hour Risk Analysis
        </h3>
      </div>
      
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trafficTrends}>
            <defs>
              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" vertical={false} />
            <XAxis 
              dataKey="hour" 
              stroke="hsl(215, 20%, 55%)" 
              tick={{ fontSize: 11 }}
              axisLine={{ stroke: 'hsl(222, 30%, 18%)' }}
            />
            <YAxis 
              stroke="hsl(215, 20%, 55%)" 
              tick={{ fontSize: 11 }}
              axisLine={{ stroke: 'hsl(222, 30%, 18%)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 8%)',
                border: '1px solid hsl(222, 30%, 18%)',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: 'hsl(210, 40%, 98%)', fontWeight: 600 }}
              itemStyle={{ color: 'hsl(215, 20%, 65%)' }}
            />
            <Area
              type="monotone"
              dataKey="riskScore"
              stroke={COLORS.primary}
              strokeWidth={2}
              fill="url(#colorRisk)"
              name="Risk Score"
            />
            <Line
              type="monotone"
              dataKey="violations"
              stroke={COLORS.warning}
              strokeWidth={2}
              dot={false}
              name="Violations"
            />
            <Line
              type="monotone"
              dataKey="accidents"
              stroke={COLORS.destructive}
              strokeWidth={2}
              dot={false}
              name="Accidents"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Risk Score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-xs text-muted-foreground">Violations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-xs text-muted-foreground">Accidents</span>
        </div>
      </div>
    </div>
  );
}

export function WeeklyChart() {
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Weekly Overview
        </h3>
      </div>
      
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyTrends} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 18%)" vertical={false} />
            <XAxis 
              dataKey="day" 
              stroke="hsl(215, 20%, 55%)" 
              tick={{ fontSize: 11 }}
              axisLine={{ stroke: 'hsl(222, 30%, 18%)' }}
            />
            <YAxis 
              stroke="hsl(215, 20%, 55%)" 
              tick={{ fontSize: 11 }}
              axisLine={{ stroke: 'hsl(222, 30%, 18%)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 8%)',
                border: '1px solid hsl(222, 30%, 18%)',
                borderRadius: '12px',
              }}
              labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
            />
            <Bar dataKey="riskScore" name="Risk Score" radius={[6, 6, 0, 0]}>
              {weeklyTrends.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.riskScore > 70 ? COLORS.destructive : entry.riskScore > 50 ? COLORS.warning : COLORS.primary}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RiskDistributionChart() {
  const distribution = [
    { name: 'Critical', value: riskZones.filter(z => z.riskLevel === 'critical').length, color: COLORS.destructive },
    { name: 'High', value: riskZones.filter(z => z.riskLevel === 'high').length, color: COLORS.warning },
    { name: 'Medium', value: riskZones.filter(z => z.riskLevel === 'medium').length, color: COLORS.primary },
    { name: 'Low', value: riskZones.filter(z => z.riskLevel === 'low').length, color: COLORS.success },
  ];
  
  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-primary" />
          Risk Distribution
        </h3>
      </div>
      
      <div className="h-[200px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={distribution}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 8%)',
                border: '1px solid hsl(222, 30%, 18%)',
                borderRadius: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-display font-bold">{riskZones.length}</div>
            <div className="text-xs text-muted-foreground">Zones</div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {distribution.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-muted-foreground">{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
