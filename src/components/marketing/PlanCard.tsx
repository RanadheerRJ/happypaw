import { Link } from 'react-router-dom';
import { Check, PawPrint } from 'lucide-react';
import type { Plan } from '@/data/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TiltCard } from '@/components/shared/TiltCard';
import { formatINR } from '@/lib/format';
import { perDayPrice } from '@/config/pricing';
import { cn } from '@/lib/utils';

function durationLabel(plan: Plan): string {
  if (plan.durationDays === 7) return '/week';
  if (plan.durationDays === 28) return '/4 weeks';
  if (plan.durationDays === 3) return '/3 days';
  return `/${plan.durationDays} days`;
}

export function PlanCard({
  plan,
  selected = false,
  onSelect,
  href,
  ctaLabel = 'Choose this plan',
  featured = false,
  className,
}: {
  plan: Plan;
  selected?: boolean;
  onSelect?: (plan: Plan) => void;
  href?: string;
  ctaLabel?: string;
  featured?: boolean;
  className?: string;
}) {
  const isSpecial = plan.weightBand === 'special';
  const price = isSpecial ? `from ${formatINR(plan.priceInr)}` : formatINR(plan.priceInr);

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[17px] font-bold leading-tight text-forest">{plan.name}</h3>
          <p className="mt-1 text-[12.5px] text-charcoal-500">
            {plan.durationDays} days · {plan.mealsPerDay} {plan.mealsPerDay === 1 ? 'meal' : 'meals'}/day
          </p>
        </div>
        {plan.badge && (
          <Badge variant={featured || plan.badge === 'Best value' ? 'accent' : 'sage'}>
            {plan.badge}
          </Badge>
        )}
      </div>

      <div className="mt-5 flex items-end gap-1.5">
        <span className="font-display text-[2rem] font-extrabold leading-none tracking-tight text-forest">
          {price}
        </span>
        {!isSpecial && (
          <span className="pb-0.5 text-[12.5px] font-medium text-charcoal-500">
            {durationLabel(plan)}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[12.5px] text-charcoal-500">
        {isSpecial ? 'Requires a vet consult' : `≈ ${formatINR(perDayPrice(plan.priceInr, plan.durationDays))} per day`}
        {plan.compareAtInr ? (
          <span className="ml-2 text-charcoal-400 line-through">{formatINR(plan.compareAtInr)}</span>
        ) : null}
      </p>

      <p className="mt-4 text-[13.5px] leading-relaxed text-charcoal-600">{plan.description}</p>

      <ul className="mt-5 space-y-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-[13px] text-charcoal-600">
            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-sage-200 text-forest">
              <Check className="h-2.5 w-2.5" strokeWidth={3.5} aria-hidden="true" />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        {onSelect ? (
          <Button
            type="button"
            onClick={() => onSelect(plan)}
            variant={selected ? 'default' : featured ? 'accent' : 'outline'}
            className="w-full"
            aria-pressed={selected}
          >
            {selected ? (
              <>
                <PawPrint className="h-4 w-4" aria-hidden="true" /> Selected
              </>
            ) : (
              ctaLabel
            )}
          </Button>
        ) : (
          <Button asChild variant={featured ? 'accent' : 'outline'} className="w-full">
            <Link to={href ?? `/plans/${plan.slug}`}>{ctaLabel}</Link>
          </Button>
        )}
        <p className="mt-2.5 text-center text-[11.5px] text-charcoal-400">
          Cancel or pause anytime · Free delivery in-zone
        </p>
      </div>
    </>
  );

  return (
    <TiltCard
      className={cn(
        'relative flex h-full flex-col rounded-3xl border bg-white p-5 shadow-soft transition-all duration-300 sm:p-6',
        selected
          ? 'scale-[1.02] border-terracotta/60 ring-2 ring-terracotta/40 shadow-lift'
          : 'border-forest/10 hover:-translate-y-1 hover:shadow-card',
        featured && !selected && 'border-forest/20',
        className,
      )}
    >
      {featured && (
        <span
          aria-hidden="true"
          className="absolute inset-x-6 -top-px h-0.5 rounded-full bg-gradient-to-r from-transparent via-terracotta to-transparent"
        />
      )}
      {body}
    </TiltCard>
  );
}
