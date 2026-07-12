import { RouteObject, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Fleet } from '../pages/Fleet';
import { Drivers } from '../pages/Drivers';
import { Routes } from '../pages/Routes';
import { Safety } from '../pages/Safety';
import { Finance } from '../pages/Finance';
import { Settings } from '../pages/Settings';

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
      { path: 'fleet', element: <Fleet /> },
      { path: 'drivers', element: <Drivers /> },
      { path: 'routes', element: <Routes /> },
      { path: 'safety', element: <Safety /> },
      { path: 'finance', element: <Finance /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];
