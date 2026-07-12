import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Mail, Key } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="py-12 text-center text-xs text-slate-400">
        Authentication session not found.
      </div>
    );
  }

  // Pre-configured role scopes based on backend seeding specifications
  const rolePermissions: Record<string, { desc: string; scopes: string[] }> = {
    Admin: {
      desc: 'Superuser access with complete system configuration and administrative scopes.',
      scopes: ['All Operational Scopes', 'User Management', 'Roles Setup', 'Security Audits'],
    },
    'Fleet Manager': {
      desc: 'Operational supervisor leading dispatch scheduling, operator records, and asset shop logs.',
      scopes: ['Vehicles CRUD', 'Drivers CRUD', 'Trips Dispatch', 'Maintenance logs'],
    },
    'Safety Officer': {
      desc: 'Compliance supervisor monitoring licensing expiration dates and overspeed triggers.',
      scopes: ['Read Fleet status', 'Safety Log auditing', 'Dispatch inspections', 'Compliance Alerts'],
    },
    'Financial Analyst': {
      desc: 'Financial reconciler auditing fuel purchase logbooks and corrective invoice claims.',
      scopes: ['Expenses Auditing', 'Fuel ledger reconciliation', 'ROI analysis reports'],
    },
    Driver: {
      desc: 'Operational dispatch operator performing routes and logging refueling purchases.',
      scopes: ['Trips list read', 'Log refueling receipts', 'Submit expense claims'],
    },
  };

  const userRole = user.role || 'Driver';
  const roleDetails = rolePermissions[userRole] || { desc: 'Standard operator role.', scopes: ['Basic read access'] };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 max-w-2xl"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-955 dark:text-white">User Operator Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Review active security level clearance and system scopes</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 transition-colors flex flex-col gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-650 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {user.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-extrabold">{userRole}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Email Address</span>
              <span className="text-sm text-slate-900 dark:text-white font-medium">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-slate-400" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Security Level</span>
              <span className="text-sm text-slate-900 dark:text-white font-medium">{userRole} Scope</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-5 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-600" />
            Authorized Scope Summary
          </h3>
          <p className="text-xs text-slate-655 dark:text-slate-350 leading-relaxed">
            {roleDetails.desc}
          </p>
          
          <div className="flex flex-wrap gap-2 mt-1">
            {roleDetails.scopes.map((scope, index) => (
              <span
                key={index}
                className="text-[10px] font-semibold bg-slate-50 text-slate-600 border px-2.5 py-0.5 rounded-md dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400"
              >
                {scope}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
