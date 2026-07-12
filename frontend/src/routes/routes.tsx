import { lazy, Suspense } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

// Lazy loaded page components
const Login = lazy(() => import('../pages/Login').then((m) => ({ default: m.Login })));
const Dashboard = lazy(() => import('../pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Vehicles = lazy(() => import('../pages/Vehicles').then((m) => ({ default: m.Vehicles })));
const Drivers = lazy(() => import('../pages/Drivers').then((m) => ({ default: m.Drivers })));
const Trips = lazy(() => import('../pages/Trips').then((m) => ({ default: m.Trips })));
const Maintenance = lazy(() => import('../pages/Maintenance').then((m) => ({ default: m.Maintenance })));
const Fuel = lazy(() => import('../pages/Fuel').then((m) => ({ default: m.Fuel })));
const Expenses = lazy(() => import('../pages/Expenses').then((m) => ({ default: m.Expenses })));
const Reports = lazy(() => import('../pages/Reports').then((m) => ({ default: m.Reports })));
const Notifications = lazy(() => import('../pages/Notifications').then((m) => ({ default: m.Notifications })));
const Profile = lazy(() => import('../pages/Profile').then((m) => ({ default: m.Profile })));
const Settings = lazy(() => import('../pages/Settings').then((m) => ({ default: m.Settings })));

// Loading spinner fallback
const LoadingFallback = () => (
  <div className="w-full h-48 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: '', element: <Navigate to="/login" replace /> },
      {
        path: 'login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Login />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'vehicles',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Vehicles />
          </Suspense>
        ),
      },
      {
        path: 'drivers',
        element: (
          <ProtectedRoute allowedRoles={['Admin', 'Fleet Manager', 'Safety Officer']}>
            <Suspense fallback={<LoadingFallback />}>
              <Drivers />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'trips',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Trips />
          </Suspense>
        ),
      },
      {
        path: 'maintenance',
        element: (
          <ProtectedRoute allowedRoles={['Admin', 'Fleet Manager', 'Safety Officer']}>
            <Suspense fallback={<LoadingFallback />}>
              <Maintenance />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'fuel',
        element: (
          <ProtectedRoute allowedRoles={['Admin', 'Fleet Manager', 'Financial Analyst']}>
            <Suspense fallback={<LoadingFallback />}>
              <Fuel />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'expenses',
        element: (
          <ProtectedRoute allowedRoles={['Admin', 'Financial Analyst']}>
            <Suspense fallback={<LoadingFallback />}>
              <Expenses />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Reports />
          </Suspense>
        ),
      },
      {
        path: 'notifications',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Notifications />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Profile />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Settings />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
];
