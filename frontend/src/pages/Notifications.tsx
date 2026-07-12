import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, ShieldAlert, AlertCircle, Wrench, Settings } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { formatDate } from '../lib/utils';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  status: string;
  type: string;
}

export const Notifications = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Notifications
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/notifications?limit=50').then((res) => res.data.data),
  });

  // Mark single as read Mutation
  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['recentNotifications'] });
      addToast('Notification marked as read', 'success');
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to update notification', 'error');
    },
  });

  // Mark all as read Mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => apiClient.post('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['recentNotifications'] });
      addToast('All notifications marked as read', 'success');
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to update notifications', 'error');
    },
  });

  // Delete notification Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['recentNotifications'] });
      addToast('Notification removed from logs', 'info');
    },
    onError: (err: any) => {
      addToast(err.response?.data?.message || 'Failed to delete notification', 'error');
    },
  });

  const icons: { [key: string]: any } = {
    Safety: <ShieldAlert className="w-5 h-5 text-rose-500" />,
    Maintenance: <Wrench className="w-5 h-5 text-amber-500" />,
    System: <Settings className="w-5 h-5 text-blue-500" />,
    Alert: <ShieldAlert className="w-5 h-5 text-red-500" />,
  };

  const notificationList = data?.data || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 max-w-4xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-955 dark:text-white">Notifications Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Review active compliance flags, speed notifications, and maintenance schedules</p>
        </div>
        {notificationList.some((n: NotificationItem) => n.status === 'Unread') && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 text-xs font-semibold"
          >
            Mark All Read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400 gap-2 flex justify-center items-center">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading alerts...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {notificationList.map((n: NotificationItem) => (
              <motion.div
                key={n._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-xl border flex items-start gap-4 transition-all bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${
                  n.status === 'Unread' ? 'ring-1 ring-indigo-500/30' : ''
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-850 flex-shrink-0 mt-0.5">
                  {icons[n.type] || <Bell className="w-5 h-5 text-indigo-500" />}
                </div>

                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{n.title}</h3>
                    <span className="text-[10px] text-slate-400">{formatDate(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-650 dark:text-slate-350 mt-1.5 leading-relaxed">{n.message}</p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {n.status === 'Unread' && (
                    <button
                      onClick={() => markReadMutation.mutate(n._id)}
                      disabled={markReadMutation.isPending}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 transition-colors"
                      title="Mark Read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate(n._id)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {notificationList.length === 0 && (
            <div className="py-12 text-center text-slate-400 bg-white dark:bg-slate-900 border rounded-xl">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              No new alerts or notifications.
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
