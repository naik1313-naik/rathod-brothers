/**
 * Admin shell: dark sidebar (desktop) / top bar (mobile), page outlet, sign-out.
 * Only mounted behind <RequireAuth>, so `admin` is guaranteed non-null here.
 */
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Inbox, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/services/AuthContext';
import { business } from '@/lib/business';

const LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
];

export function AdminLayout(): JSX.Element {
  const { admin, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navClass = ({ isActive }: { isActive: boolean }): string =>
    `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13px] font-bold transition-colors duration-300 ${
      isActive ? 'bg-gold text-navy-800' : 'text-navy-200 hover:bg-white/8 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen bg-sand-100">
      {/* ---------- sidebar (desktop) ---------- */}
      <aside className="on-dark sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-navy-900 lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <Logo className="h-10 w-10" variant="dark" />
            <div>
              <p className="font-display text-[14px] font-extrabold uppercase tracking-[0.05em] text-white">
                Rathod <span className="text-gold">Brothers</span>
              </p>
              <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-navy-300">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4" aria-label="Admin">
          {LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink key={link.to} to={link.to} className={navClass}>
                <Icon className="h-4 w-4" strokeWidth={2.2} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="truncate px-1 text-[12px] font-bold text-white">{admin?.name}</p>
          <p className="mt-0.5 truncate px-1 font-mono text-[10px] text-navy-300">{admin?.email}</p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-3 flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[12.5px] font-bold text-navy-200 transition-colors hover:bg-red-500/15 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" strokeWidth={2.2} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ---------- main column ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* mobile top bar */}
        <header className="on-dark sticky top-0 z-40 flex items-center justify-between gap-3 bg-navy-900 px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2.5">
            <Logo className="h-9 w-9" variant="dark" />
            <p className="font-display text-[13.5px] font-extrabold uppercase tracking-[0.05em] text-white">
              Admin Panel
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white"
            aria-expanded={menuOpen}
            aria-controls="admin-mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="h-4 w-4" strokeWidth={2.4} /> : <Menu className="h-4 w-4" strokeWidth={2.4} />}
          </button>
        </header>

        {menuOpen ? (
          <nav
            id="admin-mobile-nav"
            className="on-dark space-y-1 border-b border-white/10 bg-navy-800 px-4 py-3 lg:hidden"
            aria-label="Admin"
          >
            {LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={navClass}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                  {link.label}
                </NavLink>
              );
            })}
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13px] font-bold text-navy-200 transition-colors hover:bg-red-500/15 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" strokeWidth={2.2} />
              Sign out ({admin?.email})
            </button>
          </nav>
        ) : null}

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          <Outlet />
        </main>

        <footer className="px-6 pb-6 text-center text-[10.5px] text-ink-faint">
          {business.name} admin — enquiries are stored in MySQL and visible only to signed-in admins.
        </footer>
      </div>
    </div>
  );
}
