import React from 'react';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { Save, Settings as SettingsIcon, ShieldAlert } from 'lucide-react';

export const Settings: React.FC = () => {
  const { addToast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('System settings saved successfully', 'success');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 max-w-2xl"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-950 dark:text-white">System Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure global parameters, alerts threshold, safety guidelines and API configurations</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors shadow-xs flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white flex items-center gap-2 pb-3 border-b">
            <SettingsIcon className="w-4.5 h-4.5 text-indigo-600" />
            General Parameters
          </h2>
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Company Name</label>
              <input
                type="text"
                defaultValue="TransitOps Logistics Corp"
                className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Fleet Odometer Unit</label>
              <select
                defaultValue="miles"
                className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="miles">Miles (mi)</option>
                <option value="kilometers">Kilometers (km)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors shadow-xs flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-slate-955 dark:text-white flex items-center gap-2 pb-3 border-b">
            <ShieldAlert className="w-4.5 h-4.5 text-orange-500" />
            Compliance Alert Thresholds
          </h2>
          
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Over-speed Limit Alert Threshold (MPH)</label>
              <input
                type="number"
                defaultValue="75"
                className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">License Expiry Warning Interval (Days)</label>
              <input
                type="number"
                defaultValue="30"
                className="w-full px-4 py-2 border rounded-lg text-sm bg-white dark:bg-slate-950 dark:border-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-900 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 rounded-lg text-sm font-semibold transition-all shadow-xs"
          >
            <Save className="w-4 h-4" />
            Save Configurations
          </button>
        </div>
      </form>
    </motion.div>
  );
};
