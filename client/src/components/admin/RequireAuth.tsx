/**
 * Route guard for the admin area.
 *
 * Redirects to the login page when there is no valid session, preserving the
 * attempted URL in location state so the admin lands where they meant to go.
 * While the initial token check runs, a neutral placeholder is shown instead of
 * the login page — otherwise a signed-in admin would see a flash of the form on
 * every hard refresh.
 */
import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getToken } from '@/lib/api';
import { useAuth } from '@/services/AuthContext';

export function RequireAuth(): JSX.Element {
  const { isAuthenticated, initialising, signOut } = useAuth();
  const location = useLocation();

  // A token that the server rejects (expired, rotated secret) is cleared so the
  // user is not stuck in a redirect loop.
  useEffect(() => {
    if (!initialising && !isAuthenticated && getToken()) {
      void signOut();
    }
  }, [initialising, isAuthenticated, signOut]);

  if (initialising) {
    return (
      <div className="on-dark flex min-h-screen items-center justify-center bg-navy-900">
        <Loader2 className="h-6 w-6 animate-spin text-gold" strokeWidth={2.4} />
        <span className="sr-only">Checking your session</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}
