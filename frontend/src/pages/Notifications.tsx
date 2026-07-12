import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, ShieldAlert, AlertCircle, Wrench, Settings } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: string;
}

export const Notifications = () => {
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', title: 'Speed Limit Trigger', body: 'Driver John Doe exceeded speed limit on Route 4 by 12mph.', time: '5 mins ago', read: false, type: 'safety' },
    { id: '2', title: 'Inspection Request', body: 'Vehicle TX-9082 has a pending corrective maintenance window.', time: '1 hour ago', read: false, type: 'maintenance' },
    { id: '3', title: 'System Configuration Sync', body: 'GPS tracking tokens successfully synchronized with core engine.', time: '2 hours ago', read: true, type: 'system' },
  ]);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    addToast('Marked as read', 'success');
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    addToast('Notification removed', 'info');
  };

  const icons: { [key: string]: any } = {
    safety: <ShieldAlert className="w-5 h-5 text-rose-500" />,
    maintenance: <Wrench className="w-5 h-5 text-amber-500" />,
    system: <Settings className="w-5 h-5 text-blue-500" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 max-w-4xl"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-955 dark:text-white">Notifications Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Review active compliance flags, speed notifications, and maintenance schedules</p>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-4 rounded-xl border flex items-start gap-4 transition-all bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${
                !n.read ? 'ring-1 ring-indigo-500/30' : ''
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-850 flex-shrink-0 mt-0.5">
                {icons[n.type] || <Bell className="w-5 h-5 text-indigo-500" />}
              </div>

              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</h3>
                  <span className="text-[10px] text-slate-400">{n.time}</span>
                </div>
                <p className="text-xs text-slate-650 dark:text-slate-350 mt-1.5 leading-relaxed">{n.body}</p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 transition-colors"
                    title="Mark Read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {notifications.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            No new alerts or notifications.
          </div>
        )}
      </div>
    </motion.div>
  );
};
