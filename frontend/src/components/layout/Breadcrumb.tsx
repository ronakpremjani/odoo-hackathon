import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-slate-500 dark:text-slate-400">
        <li className="inline-flex items-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <Home className="w-4 h-4 mr-1.5" />
            Home
          </Link>
        </li>
        {pathnames.map((value, index) => {
          // If path is just 'dashboard', don't repeat home
          if (value.toLowerCase() === 'dashboard') return null;

          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const name = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

          return (
            <li key={to}>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-slate-400 mx-1 flex-shrink-0" />
                {isLast ? (
                  <span className="font-medium text-slate-900 dark:text-white" aria-current="page">
                    {name}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {name}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
