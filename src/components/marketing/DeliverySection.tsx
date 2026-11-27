import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarCheck, Clock3, MapPin, Truck } from 'lucide-react';
import { PincodeChecker } from '@/components/marketing/PincodeChecker';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeliveryZones } from '@/hooks/useCatalog';
import { deliverySchedule } from '@/config/pricing';
import { brand } from '@/config/brand';

export function DeliverySection() {
  const { data: zones, isLoading } = useDeliveryZones();

  return (
    <section className="section bg-teal-50">
      <div className="container-x grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-14">
        <div>
          <SectionHeading
            eyebrow="Delivery areas"
            title="Sunday mornings, sorted"
            description={`We cook on Saturday, chill overnight and deliver across ${brand.city} on Sunday. Ten neighbourhoods today, more as our kitchen grows.`}
          />

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Clock3, label: 'Order by', value: 'Thu, 11:59 PM' },
              { icon: Truck, label: 'Delivery day', value: 'Every Sunday' },
              { icon: CalendarCheck, label: 'Window', value: '7 AM – 12 PM' },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-2xl border border-grape/10 bg-white/80 p-4 shadow-soft backdrop-blur"
              >
                <Icon className="h-4 w-4 text-sunset-600" aria-hidden="true" />
                <p className="mt-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-grape-800-400">
                  {label}
                </p>
                <p className="mt-0.5 font-display text-[13.5px] font-bold text-grape-700">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-grape-500">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Areas we serve
              </p>
              <Link
                to="/delivery-areas"
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-grape-700 underline decoration-teal-400 underline-offset-4 hover:decoration-grape"
              >
                Full list <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {isLoading
                ? Array.from({ length: 8 }).map((_, index) => (
                    <li key={index}>
                      <Skeleton className="h-8 w-24 rounded-full" />
                    </li>
                  ))
                : zones?.map((zone) => (
                    <li
                      key={zone.id}
                      className="rounded-full border border-grape/10 bg-white px-3 py-1.5 text-[12px] text-grape-800-600 shadow-[0_1px_0_rgba(31,61,43,0.03)]"
                    >
                      {zone.areaName}
                      <span className="ml-1.5 text-[10.5px] text-grape-800-400">{zone.pincode}</span>
                    </li>
                  ))}
            </ul>
          </div>

          <p className="mt-6 text-[12px] text-grape-800-500">{deliverySchedule.summary}</p>
        </div>

        <Reveal className="lg:sticky lg:top-28">
          <PincodeChecker />
          <div className="mt-4 rounded-2xl border border-grape/10 bg-white/70 p-4 text-[12px] leading-relaxed text-grape-800-600">
            <strong className="font-semibold text-grape-700">Outside these areas?</strong> Join the
            waitlist and we will email you when we get there. We never share your details.
          </div>
        </Reveal>
      </div>
    </section>
  );
}
