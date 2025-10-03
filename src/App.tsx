import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuthActions, useAuthLoading } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
export default function App() {
  const { checkAuth } = useAuthActions();
  const isLoading = useAuthLoading();
  const location = useLocation();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <Toaster richColors />
    </div>
  );
}