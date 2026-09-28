/**
 * Admin authentication state.
 *
 * The JWT is held in localStorage and attached as a bearer token. This is a
 * deliberate trade-off, documented in the README: it keeps the API usable from
 * any origin (no cookie/SameSite pitfalls in production) at the cost of the
 * token being readable by script. Mitigations: short expiry, a strict
 * Content-Security-Policy, and the admin bundle being a separate chunk.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { clearToken, getToken, hasToken, setToken } from '@/lib/api';
import { login as loginRequest, logout as logoutRequest, me } from '@/services/adminService';
import type { AdminUser } from '@/types/api';

interface AuthContextValue {
  admin: AdminUser | null;
  /** True while the initial "am I signed in?" check is running. */
  initialising: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<AdminUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [initialising, setInitialising] = useState(true);

  // On mount, if a token exists, confirm it is still valid before trusting it.
  useEffect(() => {
    let cancelled = false;

    async function restore(): Promise<void> {
      if (!hasToken()) {
        setInitialising(false);
        return;
      }

      try {
        const user = await me();
        if (!cancelled) setAdmin(user);
      } catch {
        clearToken();
        if (!cancelled) setAdmin(null);
      } finally {
        if (!cancelled) setInitialising(false);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AdminUser> => {
    const result = await loginRequest(email, password);
    setToken(result.token);
    setAdmin(result.admin);
    return result.admin;
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      if (getToken()) await logoutRequest();
    } catch {
      // Even if the call fails, drop the local token — the user asked to leave.
    } finally {
      clearToken();
      setAdmin(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ admin, initialising, isAuthenticated: admin !== null, signIn, signOut }),
    [admin, initialising, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
