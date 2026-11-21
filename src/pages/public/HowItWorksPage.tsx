import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChefHat,
  ClipboardList,
  MessageSquareHeart,
  Scale,
  ShieldCheck,
  Snowflake,
  Truck,
} from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { PageHero } from '@/components/marketing/PageHero';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Reveal, RevealGroup, RevealItem } from '@/components/shared/Reveal';
import { Button } from '@/components/ui/button';
import { FaqSection } from '@/components/marketing/FaqSection';
import { images } from '@/config/assets';
import { brand } from '@/config/brand';
import { deliverySchedule, servingNotes } from '@/config/pricing';

const steps = [
  {
    icon: MessageSquareHeart,
    number: '01',
    title: 'Tell us about your dog',
    body: 'Name, age, breed, weight, body condition, activity level and allergies. Two minutes, and you can edit it any time from your account.',
    detail: 'We ask about current food and whether your dog is a picky eater, because both change how we recommend a transition.',
  },
  {
    icon: Scale,
    number: '02',
    title: 'We portion it',
    body: 'Your dog gets a daily gram target split across meals, based on weight, age and activity. Larger or more active dogs get more; less active dogs get less.',
    detail: 'Every delivery includes a portion card. Partner vets can review and override portions for dogs on special diets.',
  },
  {
    icon: ChefHat,
    number: '03',
    title: 'We cook it fresh',
    body: 'Small batches in our Hyderabad kitchen, cooked gently at low heat and blast-chilled the same morning. No preservatives, no long shelf life.',
    detail: 'Each pack is sealed and labelled with the recipe, date and your dog’s name.',
  },
  {
    icon: Truck,
    number: '04',
    title: 'We deliver weekly',
    body: 'Sunday, 7 AM – 12 PM, in insulated bags with ice packs. Straight to the fridge — four days fresh, thirty days frozen.',
    detail: `Order by ${deliverySchedule.orderCutoffWeekday} ${deliverySchedule.orderCutoffTime} for that Sunday. Pause, skip or cancel before the cut-off.`,
  },
];

const safety = [
  { icon: Snowflake, title: 'Cold chain', body: 'Cooked, blast-chilled and delivered cold. Never left at room temperature.' },
  { icon: ShieldCheck, title: 'Separate prep', body: 'Allergen-tracked prep areas, colour-coded boards and single-use gloves per batch.' },
  { icon: ClipboardList, title: 'Batch logs', body: 'Every batch is logged with recipe, cook time, chill time and portion count.' },
];

export default function HowItWorksPage() {
  return (
    <>
      <SEO
        title="How it works"
        description={`How ${brand.name} cooks and delivers fresh dog food in Hyderabad — sourcing, portions, food safety and the Sunday delivery rhythm.`}
        path="/how-it-works"
      />

      <PageHero
        eyebrow="How it works"
        title={
          <>
            A weekly rhythm,
            <span className="font-serif italic text-terracotta"> built around your dog</span>
          </>
        }
        description="From the first questionnaire to the bowl on the floor — here is exactly what happens, and what we do not do."
      >
        <div className="flex flex-wrap gap-2">
          {['Vet-formulated', 'Cooked weekly', 'Delivered Sundays', 'Pause anytime'].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-forest/15 bg-white/70 px-3 py-1.5 text-[12px] font-medium text-forest"
            >
              {chip}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="section">
        <div className="container-x">
          <SectionHeading
            eyebrow="The process"
            title="Four steps, every week"
            description="No app subscription tricks. One plan, one delivery, one clear portion per meal."
          />

          <div className="mt-12 space-y-6">
            {steps.map(({ icon: Icon, number, title, body, detail }, index) => (
              <Reveal key={title} delay={index * 0.04}>
                <div className="grid gap-5 rounded-3xl border border-forest/10 bg-white p-5 shadow-soft sm:grid-cols-[auto_1fr] sm:p-7 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                  <div className="flex items-center gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-forest text-cream">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="font-display text-[11px] font-bold tracking-[0.2em] text-forest/30 sm:hidden">
                      STEP {number}
                    </span>
                  </div>
                  <div>
                    <p className="hidden text-[10.5px] font-semibold uppercase tracking-[0.18em] text-terracotta-600 sm:block">
                      Step {number}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-bold text-forest">{title}</h3>
                    <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-charcoal-600">{body}</p>
                    <p className="mt-2.5 max-w-2xl border-l-2 border-sage-300 pl-3 text-[12.5px] leading-relaxed text-charcoal-500">
                      {detail}
                    </p>
                  </div>
                  <div className="hidden lg:block">
                    <span className="font-display text-4xl font-extrabold text-forest/[0.08]">{number}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-forest/10 bg-white py-16 sm:py-20">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <div className="overflow-hidden rounded-[32px] border border-forest/10 shadow-card">
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
          </Reveal>
          <div>
            <SectionHeading
              eyebrow="Sourcing & food safety"
              title="Boring on purpose"
              description="Fresh food only works if the cold chain works. These are the parts we refuse to compromise on."
            />
            <div className="mt-6 space-y-3">
              {safety.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-3.5 rounded-2xl border border-forest/10 bg-cream-50 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sage-100 text-forest">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-[14px] font-bold text-forest">{title}</h3>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-charcoal-600">{body}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild variant="link" className="mt-5 px-0">
              <Link to="/legal/food-safety">
                Read our food safety notes <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <SectionHeading
            eyebrow="Transition guide"
            title="Switch over 5–7 days"
            description="A sudden change is the fastest way to an upset stomach, even with good food. Mix gradually and watch."
          />
          <Reveal className="rounded-3xl border border-forest/10 bg-white p-6 shadow-soft">
            <ol className="space-y-4">
              {[
                { day: 'Days 1–2', mix: '25% fresh · 75% old food' },
                { day: 'Days 3–4', mix: '50% fresh · 50% old food' },
                { day: 'Days 5–6', mix: '75% fresh · 25% old food' },
                { day: 'Day 7', mix: '100% fresh' },
              ].map(({ day, mix }, index) => (
                <li key={day} className="flex items-center gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sage-100 font-display text-[12px] font-bold text-forest">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] font-semibold text-forest">{day}</p>
                      <p className="text-[12px] text-charcoal-500">{mix}</p>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-forest/10">
                      <div
                        className="h-full rounded-full bg-terracotta/80"
                        style={{ width: `${(index + 1) * 25}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 space-y-2.5 border-t border-forest/10 pt-5 text-[12.5px] leading-relaxed text-charcoal-600">
              <p className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                {servingNotes.storage}
              </p>
              <p className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                {servingNotes.transition}
              </p>
              <p className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                Stop and speak to your vet if you see vomiting, loose stools or itching.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <RevealGroup className="border-y border-forest/10 bg-forest-800 py-12 text-cream">
        <div className="container-x grid gap-6 sm:grid-cols-3">
          {[
            { label: 'Order cut-off', value: `${deliverySchedule.orderCutoffWeekday}, ${deliverySchedule.orderCutoffTime}` },
            { label: 'Delivery day', value: `${deliverySchedule.deliveryWeekday}, ${deliverySchedule.deliveryWindow}` },
            { label: 'Delivery fee', value: 'Free in our zones' },
          ].map((item) => (
            <RevealItem key={item.label}>
              <div className="rounded-2xl border border-cream/15 bg-cream/[0.04] p-5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-sage-300">
                  {item.label}
                </p>
                <p className="mt-2 font-display text-lg font-bold text-cream">{item.value}</p>
              </div>
            </RevealItem>
          ))}
        </div>
      </RevealGroup>

      <FaqSection limit={5} heading="Before you switch" />
    </>
  );
}
