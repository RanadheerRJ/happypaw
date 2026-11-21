import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Dog,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  Stethoscope,
  Truck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/shared/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/AuthProvider';
import { initials } from '@/lib/utils';
import type { Role } from '@/data/types';

const roleContent: Record<
  Role,
  {
    label: string;
    title: string;
    description: string;
    icon: typeof Dog;
    items: { icon: typeof Dog; title: string; body: string }[];
  }
> = {
  customer: {
    label: 'Customer portal',
    title: 'Everything about your dog, in one place',
    description:
      'Your dashboard is where the weekly rhythm lives: your dogs, their portions, the next delivery and your support threads.',
    icon: Dog,
    items: [
      { icon: Dog, title: 'Dog profiles', body: 'Weight, allergies, activity and a computed daily portion.' },
      { icon: CalendarDays, title: 'Subscription', body: 'Pause, skip a Sunday, switch plans or cancel.' },
      { icon: Truck, title: 'Deliveries', body: 'Upcoming and past deliveries with a status timeline.' },
      { icon: Package, title: 'Orders & invoices', body: 'Download print-friendly invoices for every order.' },
      { icon: LifeBuoy, title: 'Support', body: 'Raise a ticket and follow the thread with our team.' },
      { icon: Settings, title: 'Settings', body: 'Address, phone, notification preferences and password.' },
    ],
  },
  vet: {
    label: 'Vet portal',
    title: 'Clinical visibility, without the admin',
    description:
      'Review the dogs your clients have referred, approve diet plans and keep weight histories in one view.',
    icon: Stethoscope,
    items: [
      { icon: Users, title: 'Referred customers', body: 'Every client you referred, with their dogs.' },
      { icon: ClipboardList, title: 'Diet plans', body: 'Create, approve or reject plans with portion overrides.' },
      { icon: Dog, title: 'Health profiles', body: 'Weight history, allergies and clinical notes.' },
      { icon: Package, title: 'Referred orders', body: 'Read-only order history for your referred customers.' },
      { icon: CreditCard, title: 'Referrals', body: 'Your code, referral log and simulated payouts.' },
      { icon: Settings, title: 'Clinic settings', body: 'Clinic name, licence number and city.' },
    ],
  },
  admin: {
    label: 'Owner console',
    title: 'Run the whole week from one screen',
    description:
      'The kitchen prep list, delivery routes, subscriptions and support — with the numbers that matter at the top.',
    icon: LayoutDashboard,
    items: [
      { icon: LayoutDashboard, title: 'Dashboard', body: 'GMV, active subscriptions, churn and alerts.' },
      { icon: ClipboardList, title: 'Kitchen prep', body: 'Aggregate kg by recipe and print per-dog portions.' },
      { icon: Truck, title: 'Delivery routes', body: 'Build routes, reorder stops and mark deliveries.' },
      { icon: Users, title: 'Customers & dogs', body: 'Search, filter and see the full picture per customer.' },
      { icon: BookOpen, title: 'Menu & recipes', body: 'CRUD recipes and publish the weekly menu.' },
      { icon: ShieldCheck, title: 'Payments & vets', body: 'Simulated payments, refunds and vet approvals.' },
    ],
  },
};

export default function PortalPreviewPage({ role }: { role: Role }) {
  const { session, signOut } = useAuth();
  const content = roleContent[role];
  const RoleIcon = content.icon;

  async function handleSignOut() {
    await signOut();
    toast.success('Signed out');
  }

  return (
    <>
      <SEO title={content.label} path={`/${role === 'customer' ? 'app' : role}`} noIndex />

      <section className="border-b border-forest/10 bg-white/60">
        <div className="container-x flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-forest text-cream">
              <RoleIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-charcoal-400">
                {content.label}
              </p>
              <p className="font-display text-[15px] font-bold text-forest">{session?.user.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="sage" className="normal-case tracking-normal">
              {role} account
            </Badge>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-sage-200 font-display text-[11px] font-bold text-forest">
              {initials(session?.user.fullName ?? 'HP')}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
            </Button>
          </div>
        </div>
      </section>

      <section className="container-x py-12">
        <Badge variant="warn">Portal build in progress</Badge>
        <h1 className="mt-4 max-w-2xl font-display text-[2rem] font-extrabold leading-tight text-forest sm:text-4xl">
          {content.title}
        </h1>
        <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-charcoal-600">
          {content.description}
        </p>

        <div className="mt-8 rounded-3xl border border-forest/10 bg-white p-5 shadow-soft sm:p-6">
          <p className="text-[13px] leading-relaxed text-charcoal-600">
            <strong className="font-semibold text-forest">You are signed in.</strong> Sessions,
            guards and role redirects work in both data modes. The full portal screens arrive in
            phases 3–5 of this build; this page confirms the role-based entry point.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button asChild size="sm">
              <Link to="/">
                Back to the site <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to={role === 'admin' ? '/vet' : '/admin'}>
                Test a restricted area <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>

        <h2 className="mt-10 font-display text-lg font-bold text-forest">What this portal will include</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {content.items.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-forest/10 bg-white p-5 shadow-soft">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sage-100 text-forest">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <h3 className="mt-3 font-display text-[14px] font-bold text-forest">{title}</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-charcoal-600">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
