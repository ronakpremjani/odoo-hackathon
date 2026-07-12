import React from 'react';
import { BarChart } from '../components/charts/Charts';

export const Finance: React.FC = () => {
  const expenseSummary = [
    { month: 'Jan', fuel: 2400, maintenance: 1100, payroll: 3200 },
    { month: 'Feb', fuel: 2200, maintenance: 1300, payroll: 3200 },
    { month: 'Mar', fuel: 2600, maintenance: 900, payroll: 3400 },
    { month: 'Apr', fuel: 2800, maintenance: 1500, payroll: 3400 },
    { month: 'May', fuel: 3100, maintenance: 1200, payroll: 3600 },
    { month: 'Jun', fuel: 2900, maintenance: 1800, payroll: 3600 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Finance & Expenses</h1>
        <p className="text-sm text-slate-500 mt-1">Review operational financial summaries, fuel purchases and driver payouts</p>
      </div>

      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition-colors">
        <h2 className="text-sm font-semibold text-slate-950 dark:text-white mb-4">Monthly Operating Costs (Fuel, Maintenance, Payroll)</h2>
        <BarChart data={expenseSummary} xKey="month" yKey="fuel" height={280} />
      </div>
    </div>
  );
};
