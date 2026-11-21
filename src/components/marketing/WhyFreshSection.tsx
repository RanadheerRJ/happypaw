import { ChefHat, HeartPulse, Scale, Snowflake } from 'lucide-react';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { RevealGroup, RevealItem } from '@/components/shared/Reveal';

const benefits = [
  {
    icon: ChefHat,
    title: 'Gently cooked, never ultra-processed',
    body: 'Small batches at low heat. No preservatives, no rendered meals, no “meat derivatives” on the label.',
  },
  {
    icon: Scale,
    title: 'Portioned for your dog',
    body: 'Weight, age, activity and body condition decide the grams — with a portion card in every delivery.',
  },
  {
    icon: HeartPulse,
    title: 'Vet-formulated, vet-reviewable',
    body: 'Recipes are balanced with veterinary nutritionist guidance. Your own vet can review and override portions.',
  },
  {
    icon: Snowflake,
    title: 'Fresh, never shelf-stable',
    body: 'Cooked Sunday morning, blast-chilled, delivered insulated. Fridge for 4 days, freezer for 30.',
  },
];

export function WhyFreshSection() {
  return (
    <section className="border-y border-forest/10 bg-white py-16 sm:py-20">
      <div className="container-x">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Why fresh"
            title={
              <>
                Dogs do better on food
                <br className="hidden sm:block" /> you can actually recognise.
              </>
            }
            description="Not raw, not kibble, not ultra-processed. A gently cooked bowl built around whole ingredients and real portions."
          />
          <p className="max-w-xs text-[12px] leading-relaxed text-charcoal-500 lg:text-right">
            Every claim here is about what goes into the bowl — not a promise about health
            outcomes. Talk to your vet about your dog's specific needs.
          </p>
        </div>

        <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, body }, index) => (
            <RevealItem key={title}>
              <div className="group h-full rounded-3xl border border-forest/10 bg-cream-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-forest/20 hover:shadow-card">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest text-cream shadow-soft">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-display text-[11px] font-bold tracking-widest text-forest/25">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-[15.5px] font-bold leading-snug text-forest">
                  {title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-charcoal-600">{body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
