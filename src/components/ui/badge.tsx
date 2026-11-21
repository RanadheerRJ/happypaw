import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-forest text-cream',
        soft: 'bg-forest/[0.07] text-forest',
        accent: 'bg-terracotta-100 text-terracotta-600',
        sage: 'bg-sage-100 text-forest-600',
        outline: 'border border-forest/20 text-forest',
        warn: 'bg-amber-100 text-amber-800',
        danger: 'bg-red-100 text-red-700',
        success: 'bg-emerald-100 text-emerald-800',
        neutral: 'bg-charcoal/[0.06] text-charcoal-600',
      },
    },
    defaultVariants: { variant: 'soft' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
