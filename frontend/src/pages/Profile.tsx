import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Mail } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 max-w-2xl"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-955 dark:text-white">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage user account permissions and parameters</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-sm text-slate-450 mt-0.5">{user.role}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Email Address</span>
              <span className="text-sm text-slate-900 dark:text-white font-medium">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Security Level</span>
              <span className="text-sm text-indigo-600 dark:text-indigo-400 font-bold">{user.role}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
