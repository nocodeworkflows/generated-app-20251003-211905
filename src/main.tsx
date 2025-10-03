import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css';
import App from './App';
import { HomePage } from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import ToolDetailPage from '@/pages/ToolDetailPage';
import ContributionPage from '@/pages/ContributionPage';
import AdminPage from '@/pages/AdminPage';
import BuyCreditsPage from '@/pages/BuyCreditsPage';
import AboutPage from '@/pages/AboutPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/tools/:id", element: <ToolDetailPage /> },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/contribute",
        element: (
          <ProtectedRoute>
            <ContributionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/buy-credits",
        element: (
          <ProtectedRoute>
            <BuyCreditsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin",
        element: (
          <AdminProtectedRoute>
            <AdminPage />
          </AdminProtectedRoute>
        ),
      },
      { path: "/about", element: <AboutPage /> },
    ],
  },
]);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
);