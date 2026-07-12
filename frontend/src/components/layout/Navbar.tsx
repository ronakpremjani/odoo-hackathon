import React from 'react';
import { Breadcrumb } from './Breadcrumb';
import { ThemeSwitch } from './ThemeSwitch';
import { Notifications } from './Notifications';
import { ProfileDropdown } from './ProfileDropdown';
import { Menu } from 'lucide-react';

interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-550 dark:text-slate-400 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-3">
        <ThemeSwitch />
        <Notifications />
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-850 mx-1" />
        <ProfileDropdown />
      </div>
    </header>
  );
};
