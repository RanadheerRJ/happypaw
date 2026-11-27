import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, UserRound, X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { brand } from '@/config/brand';
import { deliverySchedule } from '@/config/pricing';
import { mainNav } from '@/config/nav';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';
import { useAuth, roleHome } from '@/features/auth/AuthProvider';
import { cn, initials } from '@/lib/utils';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { session } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40">
      <div className="hidden bg-grape-700 text-sand/90 sm:block">
        <div className="container-x flex h-8 items-center justify-between gap-4 text-[11.5px] font-medium tracking-wide">
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300" aria-hidden="true" />
            {deliverySchedule.summary}
          </p>
          <p className="hidden items-center gap-1.5 text-sand/70 md:flex">
            Free delivery in our {brand.city} zones · Cancel or pause anytime
          </p>
        </div>
      </div>

      <div
        className={cn(
          'transition-all duration-300',
          scrolled
            ? 'border-b border-grape/10 bg-sand/85 shadow-[0_1px_20px_-12px_rgba(31,61,43,0.35)] backdrop-blur-xl'
            : 'border-b border-transparent bg-sand/40 backdrop-blur-sm',
        )}
      >
        <div className="container-x flex h-[70px] items-center justify-between gap-4">
          <Logo />

          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
            {mainNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3.5 py-2 text-[13.5px] font-medium transition-colors',
                    isActive
                      ? 'bg-grape-700/[0.07] text-grape-700'
                      : 'text-grape-800-600 hover:bg-grape-700/[0.04] hover:text-grape-700',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {session ? (
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link to={roleHome(session.user.role)}>
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-grape-700 text-[10px] font-bold text-sand">
                    {initials(session.user.fullName)}
                  </span>
                  My account
                </Link>
              </Button>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-full px-3 py-2 text-[13.5px] font-medium text-grape-700 transition-colors hover:bg-grape-700/[0.05] sm:inline-flex"
              >
                Log in
              </Link>
            )}
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/plans">
                Build my plan <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>

            <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
              <DialogPrimitive.Trigger
                className="grid h-10 w-10 place-items-center rounded-full border border-grape/15 text-grape-700 transition-colors hover:bg-grape-700/[0.05] lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </DialogPrimitive.Trigger>
              <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-grape-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <DialogPrimitive.Content
                  className="fixed inset-x-0 top-0 z-50 max-h-[92vh] overflow-y-auto rounded-b-[28px] border-b border-grape/10 bg-sand p-5 shadow-lift data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top"
                  aria-describedby={undefined}
                >
                  <div className="flex items-center justify-between">
                    <Logo />
                    <DialogPrimitive.Close
                      className="grid h-10 w-10 place-items-center rounded-full border border-grape/15 text-grape-700"
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </DialogPrimitive.Close>
                  </div>
                  <DialogPrimitive.Title className="sr-only">Site menu</DialogPrimitive.Title>
                  <nav aria-label="Mobile navigation" className="mt-6 flex flex-col">
                    {mainNav.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center justify-between border-b border-grape/10 py-3.5 font-display text-[17px] font-semibold',
                            isActive ? 'text-sunset-600' : 'text-grape-700',
                          )
                        }
                      >
                        {item.label}
                        <ArrowRight className="h-4 w-4 opacity-40" aria-hidden="true" />
                      </NavLink>
                    ))}
                    <NavLink
                      to={session ? roleHome(session.user.role) : '/login'}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 border-b border-grape/10 py-3.5 text-[15px] font-medium text-grape-800-600"
                    >
                      <UserRound className="h-4 w-4" aria-hidden="true" />
                      {session ? 'My account' : 'Log in'}
                    </NavLink>
                  </nav>
                  <div className="mt-6 grid gap-2.5">
                    <Button asChild size="lg" onClick={() => setOpen(false)}>
                      <Link to="/plans">
                        Build my dog's meal plan <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" onClick={() => setOpen(false)}>
                      <Link to="/menu">See this week's menu</Link>
                    </Button>
                  </div>
                  <p className="mt-5 text-center text-xs text-grape-800-500">{deliverySchedule.summary}</p>
                </DialogPrimitive.Content>
              </DialogPrimitive.Portal>
            </DialogPrimitive.Root>
          </div>
        </div>
      </div>
    </header>
  );
}
