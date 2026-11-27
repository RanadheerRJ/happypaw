import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  backTo,
  backLabel = 'Back',
  className,
  align = 'left',
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  backTo?: string;
  backLabel?: string;
  className?: string;
  align?: 'left' | 'center';
}) {
  return (
    <section className={cn('grain relative overflow-hidden border-b border-grape/10 bg-sand', className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="absolute -left-16 top-24 h-56 w-56 rounded-full bg-sunset-500-100/60 blur-3xl" />
      </div>

      <div
        className={cn(
          'container-x relative py-10 sm:py-14 lg:py-16',
          align === 'center' && 'text-center',
        )}
      >
        {backTo && (
          <Link
            to={backTo}
            className="mb-5 inline-flex items-center gap-1 text-[12.5px] font-medium text-grape-800-500 transition-colors hover:text-grape-700"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {backLabel}
          </Link>
        )}
        {eyebrow && (
          <p className={cn('eyebrow mb-3', align === 'center' && 'justify-center')}>
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-sunset-500" />
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            'max-w-3xl font-display text-[2.15rem] font-extrabold leading-[1.05] text-grape-700 sm:text-5xl',
            align === 'center' && 'mx-auto',
          )}
        >
          {title}
        </h1>
        {description && (
          <p className={cn('lede mt-4 max-w-2xl', align === 'center' && 'mx-auto')}>{description}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
