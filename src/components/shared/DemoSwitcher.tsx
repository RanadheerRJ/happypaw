import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, PawPrint, RotateCcw, X } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth, roleHome } from '@/features/auth/AuthProvider';
import { showDemoChrome } from '@/config/env';
import { dataClient } from '@/data';
import type { Role } from '@/data/types';
import { cn } from '@/lib/utils';

const roles: { role: Role; label: string }[] = [
  { role: 'customer', label: 'Customer' },
  { role: 'vet', label: 'Vet' },
  { role: 'admin', label: 'Admin' },
];

/** Floating dev pill — only rendered in demo + mock mode, only while signed in. */
export function DemoSwitcher() {
  const { session, signInAsDemo, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Role | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!showDemoChrome || !session) return null;

  async function switchTo(role: Role) {
    if (role === session?.user.role) {
      navigate(roleHome(role));
      setOpen(false);
      return;
    }
    setPending(role);
    try {
      const next = await signInAsDemo(role);
      queryClient.clear();
      toast.success(`Switched to ${next.user.fullName}`, { description: `${role} demo account` });
      navigate(roleHome(next.user.role));
      setOpen(false);
    } catch {
      toast.error('Could not switch demo role');
    } finally {
      setPending(null);
    }
  }

  async function reset() {
    try {
      await dataClient.demo.reset();
      queryClient.clear();
      await signOut();
      toast.success('Demo data reset');
      navigate('/');
      setOpen(false);
    } catch {
      toast.error('Could not reset demo data');
    }
  }

  return (
    <div className="no-print fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      {open && (
        <div className="w-56 rounded-2xl border border-forest/15 bg-white p-2 shadow-lift">
          <div className="flex items-center justify-between px-2 pb-1.5 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-charcoal-400">
              Switch demo role
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-6 w-6 place-items-center rounded-full text-charcoal-400 hover:bg-forest/5"
              aria-label="Close role switcher"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>
          {roles.map((item) => (
            <button
              key={item.role}
              type="button"
              onClick={() => void switchTo(item.role)}
              disabled={pending !== null}
              className={cn(
                'flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-[12.5px] transition-colors hover:bg-cream-200/70 disabled:opacity-60',
                session.user.role === item.role
                  ? 'bg-sage-100 font-semibold text-forest'
                  : 'text-charcoal-600',
              )}
            >
              {item.label}
              {pending === item.role && <span className="text-[10px] text-charcoal-400">…</span>}
              {session.user.role === item.role && <span className="text-[10px] text-forest/60">current</span>}
            </button>
          ))}
          <div className="mt-1.5 border-t border-forest/10 pt-1.5">
            <button
              type="button"
              onClick={() => void reset()}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[12px] text-charcoal-600 hover:bg-cream-200/70"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset demo data
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[12px] text-charcoal-600 hover:bg-cream-200/70"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Sign out
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Demo role switcher"
        className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white/95 px-3.5 py-2 text-[11.5px] font-medium text-forest shadow-card backdrop-blur transition-colors hover:bg-white"
      >
        <PawPrint className="h-3.5 w-3.5 text-terracotta" aria-hidden="true" />
        Demo · {session.user.role}
      </button>
    </div>
  );
}
