import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Truck,
  Users,
  Map,
  ShieldAlert,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { user } = useAuth();

  const navigationItems = [
    {
      name: 'Dashboard',
      to: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'],
    },
    {
      name: 'Fleet Operations',
      to: '/fleet',
      icon: <Truck className="w-5 h-5" />,
      roles: ['Admin', 'Fleet Manager'],
    },
    {
      name: 'Driver Profiles',
      to: '/drivers',
      icon: <Users className="w-5 h-5" />,
      roles: ['Admin', 'Fleet Manager', 'Safety Officer'],
    },
    {
      name: 'Route Dispatch',
      to: '/routes',
      icon: <Map className="w-5 h-5" />,
      roles: ['Admin', 'Fleet Manager'],
    },
    {
      name: 'Safety & Incidents',
      to: '/safety',
      icon: <ShieldAlert className="w-5 h-5" />,
      roles: ['Admin', 'Safety Officer'],
    },
    {
      name: 'Finance & Expenses',
      to: '/finance',
      icon: <DollarSign className="w-5 h-5" />,
      roles: ['Admin', 'Financial Analyst'],
    },
    {
      name: 'System Config',
      to: '/settings',
      icon: <Settings className="w-5 h-5" />,
      roles: ['Admin'],
    },
  ];

  const allowedItems = navigationItems.filter(
    (item) => user && item.roles.includes(item.roles.find(r => r === user.role) || '')
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-slate-950 text-slate-300 border-r border-slate-900 transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center px-4 justify-between border-b border-slate-900">
        {!isCollapsed && (
          <span className="font-extrabold text-base tracking-wider uppercase bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
            TransitOps
          </span>
        )}
        {isCollapsed && (
          <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-xs">
            TO
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
        {allowedItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'hover:bg-slate-900 hover:text-white text-slate-400'
              }`
            }
          >
            {item.icon}
            {!isCollapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
