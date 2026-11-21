import type { ReactNode } from 'react';
import { BadgeCheck, ChefHat, Truck } from 'lucide-react';
import { images } from '@/config/assets';
import { brand } from '@/config/brand';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="relative min-h-[calc(100vh-140px)] overflow-hidden">
      <div className="container-x grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:py-16">
        <div className="mx-auto w-full max-w-[440px] lg:mx-0">
          <h1 className="font-display text-[1.9rem] font-extrabold leading-tight text-forest sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-charcoal-600">{subtitle}</p>
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-center text-[13px] text-charcoal-600">{footer}</div>}
        </div>

        <div className="relative hidden lg:block">
          <div className="relative overflow-hidden rounded-[32px] border border-forest/10 shadow-lift">
            <img
              src={images.dogIndie.src}
              alt={images.dogIndie.alt}
              width={images.dogIndie.width}
              height={images.dogIndie.height}
              loading="eager"
              decoding="async"
              className="aspect-[4/5] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 via-forest-900/20 to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-6 bottom-6 text-cream">
              <p className="font-serif text-2xl italic leading-snug">
                “Real food. Real happy paws.”
              </p>
              <p className="mt-2 text-[12.5px] text-cream/70">
                {brand.positioning}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { icon: BadgeCheck, label: 'Vet-formulated' },
                  { icon: ChefHat, label: 'Cooked weekly' },
                  { icon: Truck, label: 'Delivered Sundays' },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-cream/25 bg-cream/10 px-2.5 py-1 text-[10.5px] font-medium text-cream/90 backdrop-blur"
                  >
                    <Icon className="h-3 w-3" aria-hidden="true" /> {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
