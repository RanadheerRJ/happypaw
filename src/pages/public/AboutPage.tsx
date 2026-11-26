import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Heart, Leaf, ShieldCheck, XCircle } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { PageHero } from '@/components/marketing/PageHero';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal, RevealGroup, RevealItem } from '@/components/shared/Reveal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { images } from '@/config/assets';
import { brand } from '@/config/brand';
import { deliverySchedule } from '@/config/pricing';

const values = [
  {
    icon: Leaf,
    title: 'Food first, always',
    body: 'Ingredients and cooking method come before packaging, marketing or growth targets.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent by default',
    body: 'Full ingredient lists, calorie counts and allergens on every recipe page — published, not hidden.',
  },
  {
    icon: Heart,
    title: 'No miracle claims',
    body: 'We describe what is in the bowl. We do not promise to cure, treat or prevent anything.',
  },
];

export default function AboutPage() {
  return (
    <>
      <SEO
        title="Our story & kitchen"
        description={`The story behind ${brand.name} — why we started cooking fresh dog food in Hyderabad, and what goes into (and stays out of) every bowl.`}
        path="/about"
      />

      <PageHero
        eyebrow="Our story"
        title={
          <>
            We started because
            <br className="hidden sm:block" /> our own dog
            <span className="font-serif italic text-terracotta"> stopped eating.</span>
          </>
        }
        description={`${brand.name} began in a Hyderabad kitchen in ${brand.founded}, after a fussy indie refused kibble for four days and our vet asked a simple question: what are you actually feeding her?`}
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant="sage" className="py-1.5 normal-case tracking-normal">
            Founded {brand.founded}
          </Badge>
          <Badge variant="default" className="py-1.5 normal-case tracking-normal">
            {brand.address.area}, {brand.city}
          </Badge>
          <Badge variant="soft" className="py-1.5 normal-case tracking-normal">
            {brand.city}, {brand.country}
          </Badge>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div>
            <SectionHeading
              eyebrow="The idea"
              title="A week of real food, cooked once, portioned properly"
            />
            <div className="prose-happypaw mt-5">
              <p>
                Most dog food in India is designed for shelf life. Ours is designed for the week
                ahead: cooked in small batches on Saturday, chilled, portioned for one dog, and
                delivered the next morning.
              </p>
              <p>
                We are not a subscription business that happens to sell food. We are a kitchen that
                happens to deliver — which is why the menu rotates weekly, the recipes list every
                ingredient, and the portions are calculated rather than scooped.
              </p>
              <p>
                We started with ten neighbourhoods across {brand.city} because we wanted to deliver
                ourselves, in insulated bags, on a schedule we control. Every part of the cold chain
                from our kitchen to your fridge is ours.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <h3 className="flex items-center gap-2 font-display text-[13.5px] font-bold text-emerald-900">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> What goes in
                </h3>
                <ul className="mt-2 space-y-1.5 text-[12.5px] text-emerald-900/80">
                  <li>Whole proteins and seasonal vegetables</li>
                  <li>Rice, quinoa and sweet potato</li>
                  <li>Calcium, mineral mix and fish oil</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4">
                <h3 className="flex items-center gap-2 font-display text-[13.5px] font-bold text-red-900">
                  <XCircle className="h-4 w-4" aria-hidden="true" /> What never does
                </h3>
                <ul className="mt-2 space-y-1.5 text-[12.5px] text-red-900/80">
                  <li>Preservatives, colours or artificial flavours</li>
                  <li>Meat meal or “meat derivatives”</li>
                  <li>Onion, garlic, xylitol or cooked bones</li>
                </ul>
              </div>
            </div>
          </div>

          <Reveal className="space-y-4">
            <div className="overflow-hidden rounded-[28px] border border-forest/10 shadow-card">
              <img
                src={images.kitchen.src}
                alt={images.kitchen.alt}
                width={images.kitchen.width}
                height={images.kitchen.height}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-2xl border border-forest/10 shadow-soft">
                <img
                  src={images.bowlChickenPumpkin.src}
                  alt={images.bowlChickenPumpkin.alt}
                  width={900}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center rounded-2xl border border-forest/10 bg-forest-800 p-5 text-cream">
                <p className="font-serif text-lg italic leading-snug text-sage-300">
                  “If it would not go into a family meal, it does not go into a bowl.”
                </p>
                <p className="mt-3 text-[11.5px] text-cream/60">Our kitchen rule, since day one.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-forest/10 bg-white py-16">
        <div className="container-x">
          <SectionHeading
            eyebrow="What we stand for"
            title="Three rules we do not break"
            align="center"
          />
          <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-3">
            {values.map(({ icon: Icon, title, body }) => (
              <RevealItem key={title}>
                <div className="h-full rounded-3xl border border-forest/10 bg-cream-50 p-6 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-forest text-cream">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-[15px] font-bold text-forest">{title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-charcoal-600">{body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="The kitchen"
              title="Where the food is made"
              description={`Our kitchen is in ${brand.address.area}, ${brand.city} — a licensed, single-site facility where the same small team cooks, chills and packs every order.`}
            />
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ['Registered', brand.fssai],
                ['Cooking days', 'Saturday mornings'],
                ['Delivery', `${deliverySchedule.deliveryWeekday}, ${deliverySchedule.deliveryWindow}`],
                ['Order cut-off', `${deliverySchedule.orderCutoffWeekday}, ${deliverySchedule.orderCutoffTime}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-forest/10 bg-white p-4">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-charcoal-400">
                    {label}
                  </dt>
                  <dd className="mt-1 text-[12.5px] font-semibold text-forest">{value}</dd>
                </div>
              ))}
            </dl>
            <Button asChild variant="link" className="mt-5 px-0">
              <Link to="/legal/food-safety">
                Food safety &amp; storage notes <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <Reveal className="rounded-3xl border border-forest/10 bg-cream-100/70 p-6">
            <h3 className="font-display text-lg font-bold text-forest">A note on this build</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-charcoal-600">
              {brand.name} is an early-stage service. The recipes, sourcing and delivery process shown
              here describe how we work, and testimonials reflect real customer experiences. Checkout
              takes a card through a placeholder payment gateway — full payment integration lands at
              launch.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline">No medical claims</Badge>
              <Badge variant="outline">Vet-reviewable recipes</Badge>
              <Badge variant="outline">Weekly Hyderabad delivery</Badge>
            </div>
            <p className="mt-5 border-t border-forest/10 pt-4 text-[11.5px] leading-relaxed text-charcoal-500">
              {brand.medicalFootnote}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
