import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  CalendarDays,
  Dog,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Package,
  Settings,
  Truck,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '@/components/shared/Logo';
import { RouteFallback } from '@/components/shared/RouteFallback';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthProvider';
import { cn, initials } from '@/lib/utils';

const navItems = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/dogs', label: 'My dogs', icon: Dog, end: false },
  { to: '/app/subscriptions', label: 'Subscription', icon: CalendarDays, end: false },
  { to: '/app/orders', label: 'Orders', icon: Package, end: false },
  { to: '/app/deliveries', label: 'Deliveries', icon: Truck, end: false },
  { to: '/app/support', label: 'Support', icon: LifeBuoy, end: false },
  { to: '/app/settings', label: 'Settings', icon: Settings, end: false },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    toast.success('Signed out');
    navigate('/');
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link to="/" aria-label="Happy Paw home" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>

      <div className="rounded-2xl bg-forest/[0.04] p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-charcoal-400">
          Customer portal
        </p>
        <p className="mt-1 font-display text-[15px] font-bold leading-tight text-forest">
          {session?.user.fullName}
        </p>
        <p className="truncate text-xs text-charcoal-500">{session?.user.email}</p>
      </div>

      <nav aria-label="Customer portal" className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-forest text-cream shadow-soft'
                        : 'text-charcoal-600 hover:bg-forest/[0.06] hover:text-forest',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                      <span>{item.label}</span>
                      {isActive && <span className="sr-only">(current page)</span>}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-2">
        <Button asChild variant="accent" className="w-full justify-between">
          <Link to="/app/subscribe" onClick={onNavigate}>
            New subscription
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
        </Button>
      </div>
    </div>
  );
}

export function PortalLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { session } = useAuth();

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const current = [...navItems]
    .reverse()
    .find((item) =>
      item.end ? location.pathname === '/app' : location.pathname.startsWith(item.to),
    );

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex w-full max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-forest/10 bg-white/70 px-5 py-6 lg:block xl:w-72 print:hidden">
          <SidebarContent />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-forest/10 bg-cream/90 px-5 py-3 backdrop-blur lg:hidden print:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-forest/15 text-forest"
              aria-label="Open portal menu"
              aria-expanded={menuOpen}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <p className="font-display text-sm font-bold text-forest">
              {current?.label ?? 'Portal'}
            </p>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-sage-200 font-display text-[11px] font-bold text-forest">
              {initials(session?.user.fullName ?? 'HP')}
            </span>
          </header>

          {menuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-forest-900/40 backdrop-blur-[2px]"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Portal menu"
                className="relative h-full w-[86%] max-w-xs overflow-y-auto bg-cream px-5 py-6 shadow-lift"
              >
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-forest"
                  aria-label="Close portal menu"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
                <SidebarContent onNavigate={() => setMenuOpen(false)} />
              </div>
            </div>
          )}

          <main className="px-5 pb-16 pt-7 sm:px-8 lg:px-10 lg:pt-9 print:p-0">
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
