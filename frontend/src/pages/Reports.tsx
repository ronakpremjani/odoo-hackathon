import { BarChart, AreaChart } from '../components/charts/Charts';
import { motion } from 'framer-motion';
import { FileText, Download } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Reports = () => {
  const { addToast } = useToast();

  const efficiencyData = [
    { name: 'TX-9082', efficiency: 8.3 },
    { name: 'CA-1123', efficiency: 7.1 },
    { name: 'NY-8874', efficiency: 8.8 },
  ];

  const utilizationData = [
    { name: 'Mon', utilization: 75 },
    { name: 'Tue', utilization: 82 },
    { name: 'Wed', utilization: 79 },
    { name: 'Thu', utilization: 85 },
    { name: 'Fri', utilization: 90 },
    { name: 'Sat', utilization: 60 },
    { name: 'Sun', utilization: 45 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-955 dark:text-white">Operations Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Review operational audits, efficiency levels, and utilization trends</p>
        </div>
        <button
          onClick={() => addToast('Exporting reports to PDF...', 'success')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition-colors">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white mb-4">Fuel Efficiency by Vehicle (mi/km per Liter)</h2>
          <BarChart data={efficiencyData} xKey="name" yKey="efficiency" height={260} />
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs transition-colors">
          <h2 className="text-sm font-semibold text-slate-955 dark:text-white mb-4">Fleet Utilization over Week (%)</h2>
          <AreaChart data={utilizationData} xKey="name" yKey="utilization" height={260} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors">
        <h2 className="text-sm font-semibold text-slate-950 dark:text-white mb-4">Audit Logs & Documents</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 border rounded-lg border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Q2 Fuel Efficiency Audit</p>
                <p className="text-xs text-slate-400 mt-0.5">Generated on 2026-07-01</p>
              </div>
            </div>
            <button onClick={() => addToast('Downloading Audit PDF...', 'info')} className="text-xs text-indigo-600 hover:underline">Download</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
