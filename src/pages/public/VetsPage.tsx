import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  ClipboardList,
  LineChart,
  Stethoscope,
  Users,
} from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { PageHero } from '@/components/marketing/PageHero';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal, RevealGroup, RevealItem } from '@/components/shared/Reveal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { images } from '@/config/assets';
import { brand } from '@/config/brand';

const features = [
  {
    icon: Users,
    title: 'See every referred dog',
    body: 'A clinical view of weight history, allergies, current food and notes — for the dogs you send our way.',
  },
  {
    icon: ClipboardList,
    title: 'Create and approve diet plans',
    body: 'Choose recipes, override portions and add clinical notes that stay between you and the kitchen team.',
  },
  {
    icon: LineChart,
    title: 'Track progress over time',
    body: 'Weekly weight logs and plan changes, in one place, so follow-ups start with data rather than guesswork.',
  },
  {
    icon: Stethoscope,
    title: 'Your call stays final',
    body: 'When a vet sets a portion, the kitchen follows it. Customer requests for changes come to you for review.',
  },
];

export default function VetsPage() {
  return (
    <>
      <SEO
        title="Vet partner programme"
        description={`Partner with ${brand.name} in Hyderabad — review diet plans, track referred dogs' weight and allergies, and see your referral log.`}
        path="/vets"
      />

      <PageHero
        eyebrow="For veterinarians"
        title={
          <>
            Better food,
            <span className="font-serif italic text-sunset-600"> with you in the loop</span>
          </>
        }
        description="A partner programme built around clinical involvement rather than discount codes. Refer a client, keep visibility of their dog's nutrition, and override anything you disagree with."
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" className="py-1.5 normal-case tracking-normal">
            Hyderabad clinics only
          </Badge>
          <Badge variant="sage" className="py-1.5 normal-case tracking-normal">
            No cost to join
          </Badge>
          <Badge variant="soft" className="py-1.5 normal-case tracking-normal">
            Vet partner programme
          </Badge>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal className="relative">
            <div className="overflow-hidden rounded-[32px] border border-grape/10 shadow-lift">
              <img
                src={images.vet.src}
                alt={images.vet.alt}
                width={images.vet.width}
                height={images.vet.height}
                loading="lazy"
                decoding="async"
                className="aspect-[16/11] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -right-3 max-w-[240px] rounded-2xl border border-grape/10 bg-white p-4 shadow-card sm:-right-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sunset-600">
                Partner clinic
              </p>
              <p className="mt-1.5 font-display text-[13.5px] font-bold text-grape-700">
                Paws &amp; Wellness Clinic
              </p>
              <p className="text-[11.5px] text-grape-800-500">Jubilee Hills, Hyderabad</p>
              <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-emerald-700">
                <BadgeCheck className="h-3 w-3" aria-hidden="true" /> Verified partner (demo)
              </p>
            </div>
          </Reveal>

          <div>
            <SectionHeading
              eyebrow="Why partner"
              title="Nutrition is part of the consultation"
              description="Owners ask you what to feed. This gives you a partner you can point to, and a dashboard to check what is actually happening in the bowl."
            />
            <div className="mt-6 space-y-3.5">
              {features.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-3.5">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-100 text-grape-700">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-[14px] font-bold text-grape-700">{title}</h3>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-grape-800-600">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-grape/10 bg-white py-16">
        <div className="container-x">
          <SectionHeading
            eyebrow="How it works"
            title="Three steps to a partner account"
            description="Applications are reviewed manually so the programme stays small and the clinical notes stay useful."
          />
          <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              {
                step: 'Apply',
                title: 'Tell us about your practice',
                body: 'Licence number, clinic name and city. We verify every application against the Telangana register.',
              },
              {
                step: 'Get set up',
                title: 'Referral code & dashboard',
                body: 'You get a code to share with clients, plus vet login access to the dogs you refer.',
              },
              {
                step: 'Review',
                title: 'Diet plans and follow-ups',
                body: 'Approve customer-requested plans, set portion overrides and add follow-up notes after each weigh-in.',
              },
            ].map((item, index) => (
              <RevealItem key={item.step}>
                <div className="h-full rounded-3xl border border-grape/10 bg-sand-50 p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-[10.5px] font-bold uppercase tracking-[0.16em] text-sunset-600">
                      Step {index + 1}
                    </span>
                    <span className="font-display text-3xl font-extrabold text-grape-700/10">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-[16px] font-bold text-grape-700">{item.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-grape-800-600">{item.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal className="mt-10 rounded-3xl border border-grape/10 bg-teal-50 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-[15px] font-bold text-grape-700">
                  Referral rewards
                </h3>
                <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-grape-800-600">
                  Rewards are agreed per clinic and settled monthly against your referral log.
                  Payouts happen through a standard payout channel once your clinic agreement is in
                  place.
                </p>
              </div>
              <Button asChild variant="outline" className="shrink-0 bg-white">
                <Link to="/contact?topic=vet">
                  Talk to our team <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-8 rounded-[32px] border border-grape/10 bg-white p-6 shadow-soft sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Existing partners"
              title="Your dashboard is ready"
              description="Sign in with your clinic email to see referred customers, pending diet reviews and your referral log."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/login">Vet log in</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact?topic=vet">Apply to partner</Link>
              </Button>
            </div>
            <p className="mt-4 text-[11.5px] text-grape-800-500">
              Vet partners get a dedicated clinic email to sign in with. Not a vet yet?{' '}
              <Link to="/contact?topic=vet" className="font-semibold text-grape-700 underline decoration-teal-400 underline-offset-4">
                Apply to partner
              </Link>
              .
            </p>
          </div>
          <div className="rounded-2xl border border-grape/10 bg-sand-50 p-5">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-grape-800-400">
              Vet dashboard preview
            </p>
            <div className="mt-3 space-y-2.5">
              {[
                ['Referred customers', '18'],
                ['Pending diet reviews', '3'],
                ['Dogs with allergy notes', '6'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5">
                  <span className="text-[12px] text-grape-800-600">{label}</span>
                  <span className="font-display text-[13px] font-bold text-grape-700">{value}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10.5px] text-grape-800-400">Dashboard preview — your numbers appear here after sign-in.</p>
          </div>
        </div>
      </section>
    </>
  );
}
