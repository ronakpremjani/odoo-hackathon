import { RouteObject, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Vehicles } from '../pages/Vehicles';
import { Drivers } from '../pages/Drivers';
import { Trips } from '../pages/Trips';
import { Maintenance } from '../pages/Maintenance';
import { Fuel } from '../pages/Fuel';
import { Expenses } from '../pages/Expenses';
import { Reports } from '../pages/Reports';
import { Notifications } from '../pages/Notifications';
import { Profile } from '../pages/Profile';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: '', element: <Navigate to="/login" replace /> },
      { path: 'login', element: <Login /> },
    ],
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'vehicles', element: <Vehicles /> },
      { path: 'drivers', element: <Drivers /> },
      { path: 'trips', element: <Trips /> },
      { path: 'maintenance', element: <Maintenance /> },
      { path: 'fuel', element: <Fuel /> },
      { path: 'expenses', element: <Expenses /> },
      { path: 'reports', element: <Reports /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];
