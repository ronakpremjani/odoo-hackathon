import React from 'react';
import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  height?: number;
}

export const AreaChart: React.FC<ChartProps> = ({ data, xKey, yKey, height = 300 }) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
          <XAxis dataKey={xKey} className="text-[10px] fill-slate-500" />
          <YAxis className="text-[10px] fill-slate-500" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, #fff)',
              borderColor: 'var(--tooltip-border, #e2e8f0)',
              borderRadius: '8.5px',
              fontSize: '12px',
            }}
          />
          <Area type="monotone" dataKey={yKey} stroke="#6366f1" fillOpacity={1} fill="url(#colorArea)" />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const BarChart: React.FC<ChartProps> = ({ data, xKey, yKey, height = 300 }) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
          <XAxis dataKey={xKey} className="text-[10px] fill-slate-500" />
          <YAxis className="text-[10px] fill-slate-500" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, #fff)',
              borderColor: 'var(--tooltip-border, #e2e8f0)',
              borderRadius: '8.5px',
              fontSize: '12px',
            }}
          />
          <Bar dataKey={yKey} fill="#6366f1" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const LineChart: React.FC<ChartProps> = ({ data, xKey, yKey, height = 300 }) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
          <XAxis dataKey={xKey} className="text-[10px] fill-slate-500" />
          <YAxis className="text-[10px] fill-slate-500" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, #fff)',
              borderColor: 'var(--tooltip-border, #e2e8f0)',
              borderRadius: '8.5px',
              fontSize: '12px',
            }}
          />
          <Line type="monotone" dataKey={yKey} stroke="#6366f1" strokeWidth={2} activeDot={{ r: 6 }} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

interface PieChartProps {
  data: { name: string; value: number }[];
  height?: number;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const PieChart: React.FC<PieChartProps> = ({ data, height = 300 }) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, #fff)',
              borderColor: 'var(--tooltip-border, #e2e8f0)',
              borderRadius: '8.5px',
              fontSize: '12px',
            }}
          />
          <Legend formatter={(value) => <span className="text-xs text-slate-700 dark:text-slate-300">{value}</span>} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};
