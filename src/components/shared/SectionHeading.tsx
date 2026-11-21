import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from '@/components/shared/Reveal';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Reveal
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <p className="eyebrow mb-3">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-terracotta" />
          {eyebrow}
        </p>
      )}
      <h2 className="display-2">{title}</h2>
      {description && (
        <p className={cn('lede mt-4', align === 'center' && 'mx-auto max-w-xl')}>{description}</p>
      )}
      {children}
    </Reveal>
  );
}
