import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Truck,
  Users,
  Map,
  Wrench,
  Fuel,
  DollarSign,
  BarChart3,
  Bell,
  User,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  const { user } = useAuth();

  const navigationItems = [
    {
      name: 'Dashboard',
      to: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'],
    },
    {
      name: 'Vehicles',
      to: '/vehicles',
      icon: <Truck className="w-5 h-5" />,
      roles: ['Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'],
    },
    {
      name: 'Drivers',
      to: '/drivers',
      icon: <Users className="w-5 h-5" />,
      roles: ['Admin', 'Fleet Manager', 'Safety Officer'],
    },
    {
      name: 'Trips',
      to: '/trips',
      icon: <Map className="w-5 h-5" />,
      roles: ['Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'],
    },
    {
      name: 'Maintenance',
      to: '/maintenance',
      icon: <Wrench className="w-5 h-5" />,
      roles: ['Admin', 'Fleet Manager', 'Safety Officer'],
    },
    {
      name: 'Fuel Logs',
      to: '/fuel',
      icon: <Fuel className="w-5 h-5" />,
      roles: ['Admin', 'Fleet Manager', 'Financial Analyst'],
    },
    {
      name: 'Expenses',
      to: '/expenses',
      icon: <DollarSign className="w-5 h-5" />,
      roles: ['Admin', 'Financial Analyst'],
    },
    {
      name: 'Reports',
      to: '/reports',
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ['Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'],
    },
    {
      name: 'Notifications',
      to: '/notifications',
      icon: <Bell className="w-5 h-5" />,
      roles: ['Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'],
    },
    {
      name: 'Profile',
      to: '/profile',
      icon: <User className="w-5 h-5" />,
      roles: ['Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'],
    },
    {
      name: 'Settings',
      to: '/settings',
      icon: <Settings className="w-5 h-5" />,
      roles: ['Admin', 'Fleet Manager', 'Safety Officer', 'Financial Analyst'],
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
