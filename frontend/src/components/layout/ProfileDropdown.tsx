import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Shield, User as UserIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const ProfileDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-650 text-white flex items-center justify-center font-bold text-sm">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="hidden md:flex flex-col items-start text-left">
          <span className="text-xs font-semibold text-slate-950 dark:text-white leading-none">
            {user.name}
          </span>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5">
            {user.role}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                  {user.name}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                <div className="flex items-center gap-1 mt-2.5 text-[10px] text-indigo-650 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-full w-fit">
                  <Shield className="w-3 h-3" />
                  {user.role}
                </div>
              </div>

              <div className="p-1.5 flex flex-col gap-0.5">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-left transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  My Profile
                </button>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-rose-600 rounded-lg hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-left transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
