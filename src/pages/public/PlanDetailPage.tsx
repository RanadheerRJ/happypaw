import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardCheck,
  Info,
  PawPrint,
  PauseCircle,
  Truck,
  Utensils,
} from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { PageHero } from '@/components/marketing/PageHero';
import { Reveal } from '@/components/shared/Reveal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { usePlan } from '@/hooks/useCatalog';
import { deliverySchedule, perDayPrice, savingsPercent } from '@/config/pricing';
import { formatINR } from '@/lib/format';
import { brand } from '@/config/brand';

export default function PlanDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: plan, isLoading, isError, refetch } = usePlan(slug);

  if (isLoading) {
    return (
      <div className="container-x py-16" aria-busy="true">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-12 w-2/3 max-w-xl" />
        <Skeleton className="mt-4 h-4 w-full max-w-lg" />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <Skeleton className="h-80 rounded-3xl" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container-x py-20">
        <EmptyState
          title="We could not load this plan"
          description="Something went wrong fetching the details. Try again, or browse all plans."
          action={
            <div className="flex gap-2">
              <Button onClick={() => refetch()}>Try again</Button>
              <Button asChild variant="outline">
                <Link to="/plans">All plans</Link>
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (!plan) {
    return (
      <>
        <SEO title="Plan not found" path={`/plans/${slug ?? ''}`} noIndex />
        <div className="container-x py-20">
          <EmptyState
            title="That plan does not exist"
            description="It may have been renamed. Here is the current menu of plans."
            action={
              <Button asChild>
                <Link to="/plans">Browse plans</Link>
              </Button>
            }
          />
        </div>
      </>
    );
  }

  const savings = savingsPercent(plan);
  const perDay = perDayPrice(plan.priceInr, plan.durationDays);
  const isSpecial = plan.weightBand === 'special';

  return (
    <>
      <SEO
        title={plan.name}
        description={`${plan.description} ${formatINR(plan.priceInr)}. ${deliverySchedule.summary}`}
        path={`/plans/${plan.slug}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: plan.name,
          description: plan.description,
          brand: { '@type': 'Brand', name: brand.name },
          offers: {
            '@type': 'Offer',
            price: plan.priceInr,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            url: `${brand.domain}/plans/${plan.slug}`,
          },
        }}
      />

      <PageHero
        eyebrow={isSpecial ? 'Special diet' : plan.badge ?? 'Fresh plan'}
        title={plan.name}
        description={plan.description}
        backTo="/plans"
        backLabel="All plans"
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="sage" className="py-1.5 normal-case tracking-normal">
            {plan.durationDays} days · {plan.mealsPerDay} meals/day
          </Badge>
          <Badge variant="soft" className="py-1.5 normal-case tracking-normal">
            {deliverySchedule.cutoffSummary}
          </Badge>
          <Badge variant="soft" className="py-1.5 normal-case tracking-normal">
            Cancel or pause anytime
          </Badge>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-x grid gap-8 lg:grid-cols-[1.45fr_0.55fr] lg:items-start lg:gap-12">
          <div className="space-y-6">
            <Reveal className="rounded-3xl border border-grape/10 bg-white p-6 shadow-soft sm:p-8">
              <h2 className="font-display text-xl font-bold text-grape-700">What's included</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5 text-[13.5px] text-grape-800-600">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal-200 text-grape-700">
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {feature}
                  </div>
                ))}
              </div>

              <div className="mt-7 grid gap-3 border-t border-grape/10 pt-6 sm:grid-cols-3">
                {[
                  { icon: Utensils, label: `${plan.mealsPerDay} meals per day` },
                  { icon: CalendarDays, label: `${plan.durationDays} days of food` },
                  { icon: Truck, label: 'Free delivery in-zone' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-[12.5px] text-grape-800-600">
                    <Icon className="h-4 w-4 text-grape-500" aria-hidden="true" />
                    {label}
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.05} className="rounded-3xl border border-grape/10 bg-white p-6 shadow-soft sm:p-8">
              <h2 className="font-display text-xl font-bold text-grape-700">How the week works</h2>
              <ol className="mt-5 space-y-5">
                {[
                  {
                    title: 'Order before the cut-off',
                    body: `Place or edit your plan by ${deliverySchedule.orderCutoffWeekday} ${deliverySchedule.orderCutoffTime}. We cook to the order sheet on Saturday.`,
                  },
                  {
                    title: 'We cook and chill',
                    body: 'Small-batch cook, blast-chill, then portion into sealed packs labelled with your dog’s name.',
                  },
                  {
                    title: 'Delivered Sunday',
                    body: `Insulated delivery between ${deliverySchedule.deliveryWindow}, with a portion card for the week.`,
                  },
                  {
                    title: 'Feed, store, repeat',
                    body: 'Fridge for up to 4 days, freezer for 30. Next week’s order is automatic until you pause or cancel.',
                  },
                ].map((step, index) => (
                  <li key={step.title} className="flex gap-3.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-grape-700 text-[11px] font-bold text-sand">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-[14px] font-bold text-grape-700">{step.title}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-grape-800-600">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal delay={0.1} className="rounded-3xl border border-grape/10 bg-teal-50 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-grape-700">
                <PawPrint className="h-5 w-5 text-sunset-600" aria-hidden="true" />
                Portion guidance
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-grape-800-600">
                Every dog gets a portion based on weight, body condition and activity. These are the
                typical starting points for this band — your dog's card will show exact grams.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {[
                  { label: 'Less active', value: '1.8% of body weight/day' },
                  { label: 'Typical', value: '2.2% of body weight/day' },
                  { label: 'Very active', value: '2.6% of body weight/day' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-grape/10 bg-white/80 p-3.5">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-grape-800-400">
                      {item.label}
                    </p>
                    <p className="mt-1 font-display text-[12.5px] font-bold leading-snug text-grape-700">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-start gap-2 text-[11.5px] text-grape-800-500">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Estimates only. Your vet's guidance takes precedence — this is not veterinary advice.
              </p>
            </Reveal>

            <Reveal delay={0.15} className="rounded-3xl border border-grape/10 bg-white p-6 shadow-soft sm:p-8">
              <h2 className="font-display text-xl font-bold text-grape-700">Allergens &amp; special diets</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-grape-800-600">
                We cook chicken, lamb, fish and dairy in the same kitchen, so trace amounts are
                possible. If your dog has a severe allergy or a medical condition, choose the{' '}
                <Link to="/plans/special-diet" className="font-semibold text-grape-700 underline decoration-teal-400 underline-offset-4">
                  Special Diet
                </Link>{' '}
                plan so a partner vet can review your dog's profile before we cook.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline">
                  <ClipboardCheck className="h-3 w-3" aria-hidden="true" /> Vet review available
                </Badge>
                <Badge variant="outline">Allergen list on every recipe</Badge>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.08} className="lg:sticky lg:top-28">
            <div className="rounded-3xl border border-grape/15 bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-grape-800-400">
                  {plan.durationDays === 28 ? 'Every 4 weeks' : `Every ${plan.durationDays} days`}
                </p>
                {savings && <Badge variant="accent">Save {savings}%</Badge>}
              </div>
              <div className="mt-2 flex items-end gap-2">
                <span className="font-display text-4xl font-extrabold tracking-tight text-grape-700">
                  {formatINR(plan.priceInr)}
                </span>
                {plan.compareAtInr && (
                  <span className="pb-1 text-[13px] text-grape-800-400 line-through">
                    {formatINR(plan.compareAtInr)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[12.5px] text-grape-800-500">
                ≈ {formatINR(perDay)} per day · {plan.mealsPerDay} meals/day
              </p>

              <div className="mt-5 space-y-2.5 border-y border-grape/10 py-5 text-[12.5px] text-grape-800-600">
                <p className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-grape-500" aria-hidden="true" />
                  Free delivery · Sunday, {deliverySchedule.deliveryWindow}
                </p>
                <p className="flex items-center gap-2">
                  <PauseCircle className="h-4 w-4 text-grape-500" aria-hidden="true" />
                  Pause, skip or cancel before cut-off
                </p>
                <p className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-grape-500" aria-hidden="true" />
                  Portion card with every delivery
                </p>
              </div>

              <Button asChild size="lg" className="mt-5 w-full">
                <Link to={`/signup?plan=${plan.slug}`}>
                  {isSpecial ? 'Book a vet consult' : 'Start with this plan'}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-grape-800-400">
                No payment is taken yet. You will choose your dog and confirm the portion first.
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-grape/10 bg-sand-100/70 p-4 text-[12px] leading-relaxed text-grape-800-600">
              <p className="font-semibold text-grape-700">Questions about this plan?</p>
              <p className="mt-1">
                Email{' '}
                <a href={`mailto:${brand.email}`} className="underline decoration-grape/30 underline-offset-2">
                  {brand.email}
                </a>{' '}
                or call {brand.phone}, {brand.hours}.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
