import React from 'react';
import { AreaChart, PieChart } from '../components/charts/Charts';
import { Truck, Users, MapPin, AlertTriangle } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Active Vehicles', value: '42 / 50', change: '+2 today', icon: <Truck className="w-5 h-5 text-indigo-500" /> },
    { label: 'On-duty Drivers', value: '38', change: '4 on standby', icon: <Users className="w-5 h-5 text-emerald-500" /> },
    { label: 'Routes Dispatched', value: '18', change: '5 completed today', icon: <MapPin className="w-5 h-5 text-amber-500" /> },
    { label: 'Pending Incidents', value: '2', change: '-1 resolved', icon: <AlertTriangle className="w-5 h-5 text-rose-500" /> },
  ];

  const travelData = [
    { name: 'Mon', miles: 1200 },
    { name: 'Tue', miles: 1500 },
    { name: 'Wed', miles: 1100 },
    { name: 'Thu', miles: 1800 },
    { name: 'Fri', miles: 2200 },
    { name: 'Sat', miles: 900 },
    { name: 'Sun', miles: 600 },
  ];

  const expenseData = [
    { name: 'Fuel', value: 4500 },
    { name: 'Maintenance', value: 2000 },
    { name: 'Driver Payout', value: 5500 },
    { name: 'Insurance', value: 1200 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Operations Center</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time status overview of TransitOps</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs flex items-center justify-between transition-colors"
          >
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <p className="text-2xl font-bold text-slate-950 dark:text-white mt-1.5">{stat.value}</p>
              <span className="text-[10px] text-slate-400 mt-1.5 block">{stat.change}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-lg">{stat.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition-colors">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white mb-4">Operations Distance Run (Miles)</h2>
          <AreaChart data={travelData} xKey="name" yKey="miles" height={260} />
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition-colors">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white mb-4">Expense Breakdown</h2>
          <PieChart data={expenseData} height={260} />
        </div>
      </div>
    </div>
  );
};
