import React from 'react';

export const Settings: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">System Config</h1>
        <p className="text-sm text-slate-500 mt-1">Configure global parameters, alerts threshold, safety guidelines and API configurations</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors">
        <h2 className="text-sm font-semibold text-slate-950 dark:text-white mb-4">General Settings</h2>
        <div className="flex flex-col gap-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Company Name</label>
            <input
              type="text"
              defaultValue="TransitOps Logistics"
              className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Speed Limit Threshold (MPH)</label>
            <input
              type="number"
              defaultValue="70"
              className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
