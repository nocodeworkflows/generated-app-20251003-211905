import { Navigate } from 'react-router-dom';
import useAuthStore, { useUser } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
export const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const user = useUser();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!user?.isAdmin) {
    // Redirect non-admin users to their dashboard
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};