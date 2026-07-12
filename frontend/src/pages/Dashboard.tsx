import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Truck,
  Percent,
  TrendingUp,
  DollarSign,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '../api/apiClient';
import { formatCurrency } from '../lib/utils';

export const Dashboard = () => {
  const navigate = useNavigate();

  // Grayscale & clean accent palette
  const accentColors = ['#000000', '#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  // Fetch KPI data
  const { data: kpi, isLoading: kpiLoading, error: kpiError } = useQuery({
    queryKey: ['dashboardKpis'],
    queryFn: () => apiClient.get('/dashboard/kpis').then((res) => res.data.data),
  });

  // Fetch Analytics chart data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboardAnalytics'],
    queryFn: () => apiClient.get('/dashboard/analytics').then((res) => res.data.data),
  });

  // Fetch Recent Trips
  const { data: tripsData } = useQuery({
    queryKey: ['recentTrips'],
    queryFn: () => apiClient.get('/trips?limit=3').then((res) => res.data.data),
  });

  // Fetch Unread Notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['recentNotifications'],
    queryFn: () => apiClient.get('/notifications?limit=3&status=Unread').then((res) => res.data.data),
  });

  const isLoading = kpiLoading || analyticsLoading;

  if (kpiError) {
    return (
      <div className="min-h-96 flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900 border rounded-xl">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Failed to load system metrics</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-sm">Please verify the database connection and configuration</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-indigo-650 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-100 dark:bg-slate-900 border rounded-xl animate-pulse" />
        ))}
        <div className="col-span-1 md:col-span-3 h-96 bg-slate-100 dark:bg-slate-900 border rounded-xl animate-pulse" />
        <div className="h-96 bg-slate-100 dark:bg-slate-900 border rounded-xl animate-pulse" />
      </div>
    );
  }

  // Format Recharts data structures dynamically from Mongoose aggregation pipeline output
  const pieData = analytics?.vehicleStatusDistribution?.map((v: any) => ({
    name: v.status,
    value: v.count,
  })) || [];

  const barData = analytics?.maintenanceBreakdown?.map((m: any) => ({
    name: m.type,
    cost: m.totalCost,
  })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6"
    >
      {/* Sticky Topbar Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">TransitOps Core</h1>
          <p className="text-sm text-slate-500 mt-1">Enterprise Fleet Operations & ROI Intelligence Control Center</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/trips')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Dispatch Trip
          </button>
        </div>
      </div>

      {/* Modern High-Level KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start justify-between shadow-xs">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">Fleet Utilization</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-1">{kpi?.vehicles?.utilization}%</span>
            <span className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-indigo-500" />
              {kpi?.vehicles?.onTrip} of {kpi?.vehicles?.total} vehicles en route
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg text-indigo-650 dark:text-indigo-400">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start justify-between shadow-xs">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">Operational Cost</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(kpi?.financials?.totalOperationalCost || 0)}
            </span>
            <span className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-rose-500" />
              Fuel, maintenance, & outlays
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg text-rose-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start justify-between shadow-xs">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">Estimated Revenue</span>
            <span className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(kpi?.financials?.estimatedRevenue || 0)}
            </span>
            <span className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              Calculated at $2.50 / mile
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg text-emerald-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start justify-between shadow-xs">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-slate-450 font-bold uppercase tracking-wider">Return on Investment (ROI)</span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-450 mt-1">
              {kpi?.financials?.roiPercentage}%
            </span>
            <span className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-emerald-500" />
              Efficiency of asset utilization
            </span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg text-emerald-600">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts & Side Notifications Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Cost and Fuel Trend Area Chart */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Monthly Fuel Expense Trends</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.fuelTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Cost']} />
                  <Area type="monotone" dataKey="totalCost" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Maintenance Breakdown Bar Chart */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Maintenance Cost by Type</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Total Cost']} />
                    <Bar dataKey="cost" fill="#0f172a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Vehicle Status Distribution Pie */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Fleet Status Allocation</h3>
              <div className="h-44 flex items-center justify-center">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                        {pieData.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={accentColors[index % accentColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-xs text-slate-400">No vehicle state distribution records available</span>
                )}
              </div>
              <div className="flex flex-wrap gap-3 justify-center text-xs mt-2">
                {pieData.map((item: any, i: number) => (
                  <span key={item.name} className="flex items-center gap-1.5 font-medium text-slate-655 dark:text-slate-350">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColors[i % accentColors.length] }} />
                    {item.name} ({item.value})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Event Sidebar Feed */}
        <div className="flex flex-col gap-6">
          {/* Active Trips Dispatch Monitor */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex-1 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Active Dispatches</h3>
            <div className="flex flex-col gap-3 flex-1">
              {tripsData && tripsData.data && tripsData.data.length > 0 ? (
                tripsData.data.slice(0, 3).map((trip: any) => (
                  <div key={trip._id} className="p-3.5 border rounded-lg dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{trip.tripId}</span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold dark:bg-indigo-950/20 dark:text-indigo-455">
                        {trip.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
                      {trip.startLocation?.name} ➔ {trip.endLocation?.name}
                    </p>
                    <p className="text-[10px] text-slate-400">Cargo: {trip.cargoDetails?.description || 'N/A'}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-xs text-slate-400 py-12 flex-1 flex flex-col items-center justify-center">
                  No active dispatches en route
                </div>
              )}
            </div>
          </div>

          {/* Pending Alerts / Notifications */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex-1 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Compliance Alerts</h3>
            <div className="flex flex-col gap-3 flex-1">
              {notificationsData && notificationsData.data && notificationsData.data.length > 0 ? (
                notificationsData.data.slice(0, 3).map((item: any) => (
                  <div key={item._id} className="p-3 border rounded-lg dark:border-slate-800 border-l-orange-500 dark:border-l-orange-500 border-l-4">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-450 mt-1">{item.message}</p>
                  </div>
                ))
              ) : (
                <div className="text-center text-xs text-slate-400 py-12 flex-1 flex flex-col items-center justify-center">
                  All compliance parameters nominal. No active flags.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
