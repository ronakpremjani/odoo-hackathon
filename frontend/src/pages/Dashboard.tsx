import { useState } from 'react';
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
  Legend,
} from 'recharts';
import {
  Truck,
  Wrench,
  CheckCircle,
  Users,
  Clock,
  Navigation,
  Percent,
  Bell,
  DollarSign,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard = () => {
  // Grayscale minimal palettes for B&W theme
  const grayColors = ['#000000', '#4b5563', '#9ca3af', '#e5e7eb'];

  const stats = [
    { label: 'Active Vehicles', value: '28', change: 'En Route', icon: <Truck className="w-5 h-5" /> },
    { label: 'Vehicles in Maintenance', value: '5', change: 'In Shop', icon: <Wrench className="w-5 h-5" /> },
    { label: 'Available Vehicles', value: '17', change: 'Ready', icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Drivers On Duty', value: '42', change: 'Active Shift', icon: <Users className="w-5 h-5" /> },
    { label: 'Pending Trips', value: '8', change: 'Dispatched Next', icon: <Clock className="w-5 h-5" /> },
    { label: 'Active Trips', value: '28', change: 'Real-time Tracking', icon: <Navigation className="w-5 h-5" /> },
    { label: 'Fleet Utilization', value: '56.0%', change: 'Target 70%', icon: <Percent className="w-5 h-5" /> },
  ];

  // 1. Trips Per Month
  const tripsData = [
    { month: 'Jan', trips: 45 },
    { month: 'Feb', trips: 52 },
    { month: 'Mar', trips: 49 },
    { month: 'Apr', trips: 63 },
    { month: 'May', trips: 58 },
    { month: 'Jun', trips: 67 },
  ];

  // 2. Fuel Cost Trends
  const fuelData = [
    { month: 'Jan', cost: 3200 },
    { month: 'Feb', cost: 4100 },
    { month: 'Mar', cost: 3800 },
    { month: 'Apr', cost: 4900 },
    { month: 'May', cost: 4300 },
    { month: 'Jun', cost: 5200 },
  ];

  // 3. Vehicle Status Distribution
  const statusData = [
    { name: 'Active', value: 28 },
    { name: 'Available', value: 17 },
    { name: 'Maintenance', value: 5 },
  ];

  // 4. Expense Breakdown
  const expenseData = [
    { name: 'Fuel', value: 45 },
    { name: 'Maintenance', value: 20 },
    { name: 'Salaries', value: 25 },
    { name: 'Tolls', value: 10 },
  ];

  // 5. Maintenance Frequency
  const maintenanceData = [
    { type: 'Preventative', count: 12 },
    { type: 'Corrective', count: 8 },
    { type: 'Inspection', count: 15 },
    { type: 'Breakdown', count: 3 },
  ];

  // Lists Data
  const recentTrips = [
    { id: 'TRIP-992', route: 'Dallas ➔ Houston', driver: 'Bob Smith', status: 'In Progress' },
    { id: 'TRIP-991', route: 'LA ➔ Phoenix', driver: 'Jane Doe', status: 'Completed' },
    { id: 'TRIP-990', route: 'NY ➔ Boston', driver: 'Jack Miller', status: 'Completed' },
  ];

  const recentNotifications = [
    { title: 'Speed Alert', body: 'Driver Bob Smith exceeded 75mph on Route 4', time: '10m ago' },
    { title: 'Renewal Reminder', body: 'Driver Jane Doe license expires in 5 days', time: '2h ago' },
    { title: 'Service Log', body: 'Vehicle TX-9082 scheduled maintenance', time: '1d ago' },
  ];

  const recentExpenses = [
    { desc: 'Refuel Log - Shell Station', vehicle: 'TX-9082', amount: '$320.00', date: '2026-07-10' },
    { desc: 'Maintenance - Corrective Repair', vehicle: 'CA-1123', amount: '$1,200.00', date: '2026-07-08' },
    { desc: 'Road Toll - Route 4 Express', vehicle: 'NY-8874', amount: '$45.00', date: '2026-07-12' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 p-1 bg-neutral-50 dark:bg-neutral-950 min-h-screen text-black dark:text-white"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight uppercase">Operational Command Center</h1>
        <p className="text-sm text-neutral-500 mt-1">TransitOps Fleet ERP Management System Dashboard</p>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-lg shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="mt-4">
              <p className="text-xl font-bold tracking-tight">{stat.value}</p>
              <span className="text-[9px] font-medium text-neutral-400 mt-1 block">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trips Per Month (AreaChart) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-lg lg:col-span-2">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-4">Trips Volume Trend</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tripsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="bwGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" className="dark:stroke-neutral-800" />
                <XAxis dataKey="month" className="text-[10px] font-medium fill-neutral-500" />
                <YAxis className="text-[10px] font-medium fill-neutral-500" />
                <Tooltip contentStyle={{ backgroundColor: '#000', color: '#fff', fontSize: '11px', borderRadius: '4px' }} />
                <Area type="monotone" dataKey="trips" stroke="#000000" strokeWidth={1.5} fillOpacity={1} fill="url(#bwGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Status (PieChart) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-lg">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-4">Vehicle Status</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={grayColors[index % grayColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#000', color: '#fff', fontSize: '11px', borderRadius: '4px' }} />
                <Legend formatter={(value) => <span className="text-[10px] font-medium uppercase">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fuel Cost Trend (BarChart) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-lg">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-4">Fuel Expense Trend ($)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" className="dark:stroke-neutral-800" />
                <XAxis dataKey="month" className="text-[10px] font-medium fill-neutral-500" />
                <YAxis className="text-[10px] font-medium fill-neutral-500" />
                <Tooltip contentStyle={{ backgroundColor: '#000', color: '#fff', fontSize: '11px', borderRadius: '4px' }} />
                <Bar dataKey="cost" fill="#000000" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown (PieChart) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-lg">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-4">Expense Distribution (%)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                  {expenseData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={grayColors[index % grayColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#000', color: '#fff', fontSize: '11px', borderRadius: '4px' }} />
                <Legend formatter={(value) => <span className="text-[10px] font-medium uppercase">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Frequency (BarChart) */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-lg">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-4">Maintenance Tasks count</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" className="dark:stroke-neutral-800" />
                <XAxis dataKey="type" className="text-[9px] font-medium fill-neutral-500" />
                <YAxis className="text-[10px] font-medium fill-neutral-500" />
                <Tooltip contentStyle={{ backgroundColor: '#000', color: '#fff', fontSize: '11px', borderRadius: '4px' }} />
                <Bar dataKey="count" fill="#4b5563" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        
        {/* Recent Trips */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Navigation className="w-4 h-4 text-neutral-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider">Recent Dispatches</h2>
          </div>
          <div className="flex flex-col gap-3">
            {recentTrips.map((t, idx) => (
              <div key={idx} className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0 last:pb-0">
                <div>
                  <span className="text-[11px] font-bold block">{t.id}</span>
                  <span className="text-[10px] text-neutral-450">{t.route} | {t.driver}</span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${t.status === 'In Progress' ? 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200' : 'bg-neutral-200 text-neutral-600'}`}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-neutral-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider">Alert Feed</h2>
          </div>
          <div className="flex flex-col gap-3">
            {recentNotifications.map((n, idx) => (
              <div key={idx} className="flex justify-between items-start pb-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0 last:pb-0">
                <div className="max-w-[75%]">
                  <span className="text-[10px] font-bold block">{n.title}</span>
                  <span className="text-[9px] text-neutral-500 leading-tight block mt-0.5">{n.body}</span>
                </div>
                <span className="text-[9px] text-neutral-400 font-medium">{n.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-neutral-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider">Recent Expenses</h2>
          </div>
          <div className="flex flex-col gap-3">
            {recentExpenses.map((e, idx) => (
              <div key={idx} className="flex justify-between items-center pb-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0 last:pb-0">
                <div>
                  <span className="text-[10px] font-bold block">{e.desc}</span>
                  <span className="text-[9px] text-neutral-450">{e.vehicle} | {e.date}</span>
                </div>
                <span className="text-[11px] font-bold">{e.amount}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </motion.div>
  );
};
