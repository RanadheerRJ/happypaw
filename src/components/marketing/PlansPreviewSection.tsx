import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { PlanCard } from '@/components/marketing/PlanCard';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { usePlans } from '@/hooks/useCatalog';
import { deliverySchedule } from '@/config/pricing';

export function PlansPreviewSection() {
  const { data: plans, isLoading } = usePlans();
  const weekly = plans?.filter(
    (plan) => plan.durationDays === 7 && ['small', 'medium', 'large'].includes(plan.weightBand),
  );

  return (
    <section className="section bg-[#F7F2E7]">
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Plans & pricing"
            title="Pick a size. We'll do the maths."
            description="Weekly plans are priced by your dog's weight band. Prepay for four weeks and save 10%."
          />
          <Reveal delay={0.1}>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-forest/10 bg-white/70 px-4 py-3 text-[12.5px] text-forest shadow-soft">
              <Clock className="h-4 w-4 text-terracotta" aria-hidden="true" />
              <span>
                <strong className="font-semibold">Order by {deliverySchedule.orderCutoffWeekday} {deliverySchedule.orderCutoffTime}</strong>
                <br />
                <span className="text-charcoal-500">for Sunday delivery, {deliverySchedule.deliveryWindow}</span>
              </span>
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading || !weekly
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-3xl border border-forest/10 bg-white p-6">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="mt-2 h-3 w-28" />
                  <Skeleton className="mt-6 h-9 w-32" />
                  <Skeleton className="mt-4 h-3 w-full" />
                  <Skeleton className="mt-2 h-3 w-5/6" />
                  <Skeleton className="mt-6 h-11 w-full rounded-full" />
                </div>
              ))
            : weekly.map((plan, index) => (
                <Reveal key={plan.id} delay={index * 0.06} className="h-full">
                  <PlanCard
                    plan={plan}
                    featured={plan.weightBand === 'medium'}
                    href={`/plans/${plan.slug}`}
                    ctaLabel="Choose plan"
                  />
                </Reveal>
              ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-3xl border border-forest/10 bg-white/60 p-5 sm:flex-row">
          <p className="text-[13px] text-charcoal-600">
            Monthly prepaid plans from <strong className="text-forest">₹2,696</strong> · Trial box{' '}
            <strong className="text-forest">₹299</strong> · Fresh topper{' '}
            <strong className="text-forest">₹349/week</strong> · Special diets from{' '}
            <strong className="text-forest">₹1,299/week</strong>
          </p>
          <Button asChild variant="outline" className="shrink-0 bg-white">
            <Link to="/plans">
              Compare all plans <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
