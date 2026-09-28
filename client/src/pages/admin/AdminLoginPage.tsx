/**
 * Admin sign-in.
 *
 * Failed attempts are shown as a single generic message and the API's own
 * rate limiter throttles repeated tries, so this form deliberately does not
 * reveal whether an email exists.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, LogIn, Mail } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/services/AuthContext';
import { applyPageMeta } from '@/lib/seo';
import { ApiError } from '@/types/api';

export function AdminLoginPage(): JSX.Element {
  const { isAuthenticated, initialising, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    applyPageMeta({
      title: 'Admin Sign In | Rathod Brothers',
      description: 'Authorised Rathod Brothers administrators only.',
      path: '/admin/login',
      index: false,
    });
  }, []);

  if (!initialising && isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from ?? '/admin/dashboard';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Enter your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      const from = (location.state as { from?: string } | null)?.from ?? '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.status === 429
            ? 'Too many sign-in attempts. Wait a few minutes and try again.'
            : 'Incorrect email or password.'
          : 'Could not reach the server. Check that the API is running.',
      );
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="on-dark relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-900 px-5 py-12">
      <div className="grid-overlay-dark" aria-hidden="true" />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(241,189,24,0.14),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Logo className="h-14 w-14" variant="dark" />
          <h1 className="mt-5 font-display text-[24px] font-extrabold uppercase tracking-[0.05em] text-white">
            Rathod <span className="text-gold">Brothers</span>
          </h1>
          <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-navy-300">
            Admin Panel
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border border-white/10 bg-white p-6 shadow-card-lg"
        >
          <label htmlFor="admin-email" className="field-label">
            Email
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
              strokeWidth={2.2}
              aria-hidden="true"
            />
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="field pl-10"
              placeholder="admin@rathodbrothers.com"
            />
          </div>

          <label htmlFor="admin-password" className="field-label mt-4">
            Password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
              strokeWidth={2.2}
              aria-hidden="true"
            />
            <input
              id="admin-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field px-10"
              placeholder="••••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-sand-200 hover:text-navy-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" strokeWidth={2.2} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={2.2} />
              )}
            </button>
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-50 px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed text-red-800"
            >
              <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.6} />
                Signing in…
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" strokeWidth={2.4} />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-navy-300">
          This area is for authorised administrators only. Enquiries submitted by visitors are stored
          securely and are never shown publicly.
        </p>
      </div>
    </div>
  );
}
