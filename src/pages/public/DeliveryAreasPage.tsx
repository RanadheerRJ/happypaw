import { MapPin, Clock3, Truck, CalendarCheck } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { PageHero } from '@/components/marketing/PageHero';
import { PincodeChecker } from '@/components/marketing/PincodeChecker';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal, RevealGroup, RevealItem } from '@/components/shared/Reveal';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useDeliveryZones } from '@/hooks/useCatalog';
import { deliverySchedule } from '@/config/pricing';
import { brand } from '@/config/brand';

export default function DeliveryAreasPage() {
  const { data: zones, isLoading } = useDeliveryZones();

  return (
    <>
      <SEO
        title="Delivery areas in Hyderabad"
        description={`Check whether we deliver fresh dog food to your Hyderabad pincode. Serving Madhapur, Gachibowli, Kondapur, HITEC City, Jubilee Hills and more. ${deliverySchedule.summary}`}
        path="/delivery-areas"
      />

      <PageHero
        eyebrow="Delivery areas"
        title={
          <>
            Ten neighbourhoods.
            <span className="font-serif italic text-sunset-600"> One delivery day.</span>
          </>
        }
        description={`We deliver across ${brand.city} every Sunday between ${deliverySchedule.deliveryWindow}. Check your pincode, or join the waitlist and we will come to you next.`}
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" className="py-1.5 normal-case tracking-normal">
            <Truck className="h-3.5 w-3.5" aria-hidden="true" /> Free delivery in-zone
          </Badge>
          <Badge variant="sage" className="py-1.5 normal-case tracking-normal">
            Chilled, insulated bags
          </Badge>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-x grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:gap-12">
          <div>
            <SectionHeading
              eyebrow="Check your pincode"
              title="Are we on your street yet?"
              description="Enter your 6-digit pincode. If we are not there, join the waitlist — the areas with the most requests get added first."
            />
            <div className="mt-6">
              <PincodeChecker />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Clock3, label: 'Order by', value: `${deliverySchedule.orderCutoffWeekday}, ${deliverySchedule.orderCutoffTime}` },
                { icon: CalendarCheck, label: 'Delivery day', value: deliverySchedule.deliveryWeekday },
                { icon: Truck, label: 'Window', value: deliverySchedule.deliveryWindow },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl border border-grape/10 bg-white p-4">
                  <Icon className="h-4 w-4 text-sunset-600" aria-hidden="true" />
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-grape-800-400">
                    {label}
                  </p>
                  <p className="mt-0.5 font-display text-[12.5px] font-bold text-grape-700">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="rounded-3xl border border-grape/10 bg-white p-5 shadow-soft sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-display text-[15px] font-bold text-grape-700">
                  <MapPin className="h-4 w-4 text-sunset-600" aria-hidden="true" /> Areas we serve
                </h2>
                <span className="text-[11px] text-grape-800-400">
                  {zones?.length ?? '—'} areas
                </span>
              </div>

              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {isLoading
                  ? Array.from({ length: 10 }).map((_, index) => (
                      <li key={index}>
                        <Skeleton className="h-12 w-full rounded-xl" />
                      </li>
                    ))
                  : zones?.map((zone) => (
                      <li
                        key={zone.id}
                        className="flex items-center justify-between rounded-xl border border-grape/[0.08] bg-sand-50 px-3 py-2.5 transition-colors hover:border-grape/20"
                      >
                        <span className="text-[12.5px] font-medium text-grape-700">{zone.areaName}</span>
                        <span className="font-mono text-[11px] text-grape-800-500">{zone.pincode}</span>
                      </li>
                    ))}
              </ul>

              <p className="mt-4 border-t border-grape/10 pt-4 text-[11.5px] leading-relaxed text-grape-800-500">
                Pincodes are grouped by area; some pincodes cover multiple neighbourhoods. If your
                pincode matches but your street is outside our route, we will call before your first
                delivery.
              </p>
            </div>

            <RevealGroup className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { title: 'Chilled, not frozen', body: 'Insulated bags with ice packs, packed the same morning.' },
                { title: 'Doorstep handover', body: 'We ring the bell and hand over — no left-on-the-step surprises.' },
              ].map((item) => (
                <RevealItem key={item.title}>
                  <div className="h-full rounded-2xl border border-grape/10 bg-sand-100/70 p-4">
                    <h3 className="font-display text-[12.5px] font-bold text-grape-700">{item.title}</h3>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-grape-800-600">{item.body}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      <section className="border-t border-grape/10 bg-teal-50 py-14">
        <div className="container-x">
          <SectionHeading
            eyebrow="Expanding"
            title="Not on the list? Tell us where you are."
            description="We add new areas when there is enough demand to keep deliveries within the Sunday window. Waitlist entries are counted by pincode, not sold."
            align="center"
          />
          <Reveal className="mx-auto mt-7 max-w-lg">
            <PincodeChecker compact />
          </Reveal>
        </div>
      </section>
    </>
  );
}
