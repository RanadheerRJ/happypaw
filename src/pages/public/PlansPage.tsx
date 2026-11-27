import { Link } from 'react-router-dom';
import { ArrowRight, Check, Gift, Info, Sparkles, Truck } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { PageHero } from '@/components/marketing/PageHero';
import { PlanCard } from '@/components/marketing/PlanCard';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal, RevealGroup, RevealItem } from '@/components/shared/Reveal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAddons, usePlans } from '@/hooks/useCatalog';
import { deliverySchedule, planFixtures, perDayPrice } from '@/config/pricing';
import { formatINR } from '@/lib/format';
import { brand } from '@/config/brand';
import type { Plan } from '@/data/types';

function weeklyEquivalent(plan: Plan): number {
  return Math.round((plan.priceInr / plan.durationDays) * 7);
}

export default function PlansPage() {
  const { data: plans, isLoading } = usePlans();
  const { data: addons } = useAddons();

  const weekly = plans?.filter(
    (plan) => plan.durationDays === 7 && ['small', 'medium', 'large'].includes(plan.weightBand),
  );
  const monthly = plans?.filter((plan) => plan.durationDays === 28);
  const others = plans?.filter(
    (plan) => !weekly?.some((item) => item.id === plan.id) && !monthly?.some((item) => item.id === plan.id),
  );

  return (
    <>
      <SEO
        title="Plans & pricing"
        description={`Fresh dog food plans in Hyderabad from ₹749/week. Weekly and monthly prepaid plans, trial box, topper and special diets. ${deliverySchedule.summary}`}
        path="/plans"
        jsonLd={planFixtures.map((plan) => ({
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
        }))}
      />

      <PageHero
        eyebrow="Plans & pricing"
        title={
          <>
            One bowl at a time.
            <span className="font-serif italic text-sunset-600"> No lock-in.</span>
          </>
        }
        description="Weekly plans priced by weight band, with a 10% saving when you prepay for four weeks. Cancel or pause any time before the Thursday cut-off."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default" className="gap-1.5 py-1.5 normal-case tracking-normal">
            <Truck className="h-3.5 w-3.5" aria-hidden="true" /> Free delivery in our zones
          </Badge>
          <Badge variant="sage" className="py-1.5 normal-case tracking-normal">
            {deliverySchedule.cutoffSummary}
          </Badge>
          <Badge variant="soft" className="py-1.5 normal-case tracking-normal">
            First delivery Sunday
          </Badge>
        </div>
      </PageHero>

      <section className="section pb-10">
        <div className="container-x">
          <SectionHeading
            eyebrow="Weekly Fresh"
            title="A full week, two meals a day"
            description="Billed weekly. Skip a Sunday whenever you need to — your next delivery moves automatically."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="rounded-3xl border border-grape/10 bg-white p-6">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="mt-6 h-9 w-32" />
                    <Skeleton className="mt-4 h-3 w-full" />
                    <Skeleton className="mt-2 h-3 w-5/6" />
                    <Skeleton className="mt-6 h-11 w-full rounded-full" />
                  </div>
                ))
              : weekly?.map((plan, index) => (
                  <Reveal key={plan.id} delay={index * 0.05}>
                    <PlanCard
                      plan={plan}
                      featured={plan.weightBand === 'medium'}
                      href={`/plans/${plan.slug}`}
                      ctaLabel="Choose this plan"
                    />
                  </Reveal>
                ))}
          </div>
        </div>
      </section>

      <section className="bg-sand-200/60 py-14">
        <div className="container-x">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Monthly Fresh"
              title="Prepay four weeks, save 10%"
              description="Same food, same Sunday delivery, lower per-day cost. Unused weeks stay as account credit if you pause."
            />
            <Badge variant="accent" className="mb-1 self-start sm:self-auto">
              Best value
            </Badge>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-64 rounded-3xl bg-white/60" />
                ))
              : monthly?.map((plan, index) => (
                  <Reveal key={plan.id} delay={index * 0.05}>
                    <PlanCard
                      plan={plan}
                      href={`/plans/${plan.slug}`}
                      ctaLabel="Save 10% monthly"
                      className="border-grape/15"
                    />
                  </Reveal>
                ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <SectionHeading
            eyebrow="Try it, or top it up"
            title="Start small. Change later."
            description="A trial box to test the waters, a topper to upgrade the food you already buy, and a vet-led path for special diets."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-72 rounded-3xl" />
                ))
              : others?.map((plan, index) => (
                  <Reveal key={plan.id} delay={index * 0.05}>
                    <PlanCard plan={plan} href={`/plans/${plan.slug}`} ctaLabel={plan.weightBand === 'special' ? 'Book a vet consult' : 'Choose this plan'} />
                  </Reveal>
                ))}
          </div>
        </div>
      </section>

      <section className="border-y border-grape/10 bg-white py-16">
        <div className="container-x">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading eyebrow="Compare" title="Every plan, side by side" />
            <p className="text-[12px] text-grape-800-500">
              Prices include free delivery within our Hyderabad zones.
            </p>
          </div>

          <div className="mt-8 overflow-x-auto rounded-3xl border border-grape/10 shadow-soft">
            <table className="w-full min-w-[720px] border-collapse bg-white text-left text-[13px]">
              <caption className="sr-only">Comparison of all Happy Paw subscription plans</caption>
              <thead>
                <tr className="border-b border-grape/10 bg-sand-100 text-[10.5px] uppercase tracking-[0.1em] text-grape-800-500">
                  <th scope="col" className="px-5 py-3.5 font-semibold">Plan</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Duration</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Price</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Per day</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Per week</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {(plans ?? planFixtures).map((plan) => (
                  <tr key={plan.id} className="border-b border-grape/[0.07] last:border-b-0 hover:bg-sand-50">
                    <th scope="row" className="px-5 py-3.5">
                      <Link
                        to={`/plans/${plan.slug}`}
                        className="font-display text-[13px] font-bold text-grape-700 hover:text-sunset-600"
                      >
                        {plan.name}
                      </Link>
                    </th>
                    <td className="px-4 py-3.5 text-grape-800-600">{plan.durationDays} days</td>
                    <td className="px-4 py-3.5 font-semibold text-grape-700">
                      {plan.weightBand === 'special' ? 'from ' : ''}
                      {formatINR(plan.priceInr)}
                    </td>
                    <td className="px-4 py-3.5 text-grape-800-600">
                      {formatINR(perDayPrice(plan.priceInr, plan.durationDays))}
                    </td>
                    <td className="px-4 py-3.5 text-grape-800-600">{formatINR(weeklyEquivalent(plan))}</td>
                    <td className="px-4 py-3.5 text-[12px] text-grape-800-500">
                      {plan.badge ?? (plan.weightBand === 'special' ? 'Vet consult required' : '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 flex items-start gap-2 text-[11.5px] text-grape-800-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Per-day and per-week figures are rounded. The trial box is limited to one per household.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <SectionHeading
            eyebrow="Add-ons"
            title="A little extra in the box"
            description="Add any of these to a weekly delivery. They are billed once per delivery week."
          />
          <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {addons?.map((addon) => (
              <RevealItem key={addon.id}>
                <div className="flex h-full flex-col rounded-3xl border border-grape/10 bg-white p-5 shadow-soft transition-transform duration-300 hover:-translate-y-1">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-sunset-500-50 text-sunset-600">
                    <Gift className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3.5 font-display text-[14.5px] font-bold text-grape-700">{addon.name}</h3>
                  <p className="mt-1 font-display text-[13px] font-semibold text-sunset-600">
                    + {formatINR(addon.priceInr)}
                  </p>
                  <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-grape-800-600">
                    {addon.description}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-x">
          <div className="rounded-[32px] border border-grape/10 bg-sand-50 p-6 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <Badge variant="sage">
                  <Sparkles className="h-3 w-3" aria-hidden="true" /> The weekly rhythm
                </Badge>
                <h2 className="mt-4 font-display text-2xl font-bold text-grape-700 sm:text-3xl">
                  Order by Thursday. Eat on Sunday.
                </h2>
                <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-grape-800-600">
                  We cook to the week's order sheet, so the cut-off is firm. Place or change your
                  order by {deliverySchedule.orderCutoffWeekday} {deliverySchedule.orderCutoffTime} and
                  it will be in the kitchen on Saturday.
                </p>
              </div>
              <ul className="grid gap-2.5 text-[13px] text-grape-800-600">
                {[
                  'Free delivery in all 10 Hyderabad zones',
                  'Pause, skip or cancel before the cut-off',
                  'Chilled delivery, 7 AM – 12 PM on Sunday',
                  'Unused prepaid weeks stay as account credit',
                  'Card payment captured at checkout, no charge before your first box',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-grape-700 text-sand">
                      <Check className="h-2.5 w-2.5" strokeWidth={3.5} aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 text-center">
            <h2 className="font-display text-xl font-bold text-grape-700">Not sure which plan fits?</h2>
            <p className="max-w-md text-[13.5px] text-grape-800-600">
              Add your dog and we will recommend a weight band and daily portion before you pay
              anything.
            </p>
            <Button asChild size="lg">
              <Link to="/signup">
                Build my dog's plan <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
