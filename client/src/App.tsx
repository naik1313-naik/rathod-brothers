/**
 * Application root: global chrome, routes and the intro loader.
 *
 * The public site is a single scrolling page, so the navbar, footer, floating
 * action bar and custom cursor are mounted by the public route rather than the
 * shell — the admin area gets none of that chrome.
 */
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FloatingActions } from '@/components/FloatingActions';
import { CustomCursor } from '@/components/CustomCursor';
import { Loader } from '@/components/Loader';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AuthProvider } from '@/services/AuthContext';

/**
 * The admin area is lazily loaded. Public visitors — who are the overwhelming
 * majority of traffic — never download it, which also keeps the auth code and
 * its localStorage token handling out of the marketing bundle.
 */
const AdminLoginPage = lazy(() =>
  import('@/pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })),
);
const AdminLayout = lazy(() =>
  import('@/components/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })),
);
const RequireAuth = lazy(() =>
  import('@/components/admin/RequireAuth').then((m) => ({ default: m.RequireAuth })),
);
const AdminDashboardPage = lazy(() =>
  import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminEnquiriesPage = lazy(() =>
  import('@/pages/admin/AdminEnquiriesPage').then((m) => ({ default: m.AdminEnquiriesPage })),
);

const INTRO_SEEN_KEY = 'rb_intro_seen';

/** Resets scroll on navigation — the SPA keeps the previous offset otherwise. */
function ScrollToTop(): null {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function PublicSite(): JSX.Element {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1}>
        <HomePage />
      </main>
      <Footer />
      <FloatingActions />
      <CustomCursor />
    </>
  );
}

export function App(): JSX.Element {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  // The intro plays once per browser session, never on client-side navigation.
  const [introDone, setIntroDone] = useState(() => sessionStorage.getItem(INTRO_SEEN_KEY) === '1');

  const finishIntro = useCallback((): void => {
    sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    setIntroDone(true);
  }, []);

  return (
    <AuthProvider>
      <ScrollToTop />
      {!introDone && !isAdmin ? <Loader onComplete={finishIntro} /> : null}

      <Suspense fallback={isAdmin ? <AdminFallback /> : <PublicFallback />}>
        <Routes>
          <Route path="/" element={<PublicSite />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="enquiries" element={<AdminEnquiriesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

/** Shown while an admin chunk downloads. */
function AdminFallback(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-100">
      <Loader2 className="h-6 w-6 animate-spin text-navy-600" strokeWidth={2.4} />
      <span className="sr-only">Loading admin panel</span>
    </div>
  );
}

/** Keeps the page background stable during a public-route chunk load. */
function PublicFallback(): JSX.Element {
  return <div className="min-h-screen bg-sand-100" />;
}
