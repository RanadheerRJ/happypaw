import { BadgeCheck, Quote, Stethoscope } from 'lucide-react';
import { images } from '@/config/assets';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Badge } from '@/components/ui/badge';

export function VetTrustSection() {
  return (
    <section className="section bg-white">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative overflow-hidden rounded-[32px] border border-forest/10 shadow-lift">
            <img
              src={images.vet.src}
              alt={images.vet.alt}
              width={images.vet.width}
              height={images.vet.height}
              loading="lazy"
              decoding="async"
              className="aspect-[16/11] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-900/35 to-transparent" aria-hidden="true" />
          </div>

          <div className="absolute -bottom-6 left-4 right-4 rounded-2xl border border-forest/10 bg-cream p-4 shadow-card sm:left-6 sm:right-auto sm:max-w-[330px]">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-terracotta-600">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Recipe review
            </div>
            <p className="mt-2 font-display text-[14.5px] font-bold text-forest">Dr. Meera Iyer</p>
            <p className="text-[12px] text-charcoal-600">BVSc &amp; AH · TSVC-2019-04412</p>
            <p className="mt-1 text-[12px] text-charcoal-500">
              Paws &amp; Wellness Clinic, Hyderabad
            </p>
            <p className="mt-2.5 border-t border-forest/10 pt-2.5 text-[10.5px] text-charcoal-400">
              Sample credential card — demo content
            </p>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="Vet-formulated"
            title={
              <>
                Formulated with vets.
                <br />
                <span className="font-serif font-semibold italic text-terracotta">Not marketing.</span>
              </>
            }
            description="Every recipe is built against a nutrient profile with veterinary nutritionist guidance — then reviewed with partner vets in Hyderabad before it reaches the menu."
          />

          <ul className="mt-7 space-y-4">
            {[
              {
                icon: Stethoscope,
                title: 'Your vet stays in charge',
                body: 'Partner vets can review your dog’s profile and override portions. Special diets require a consult before we cook.',
              },
              {
                icon: BadgeCheck,
                title: 'Full disclosure on every bowl',
                body: 'Ingredients, percentages, calories per 100g and allergens are published on the menu — not buried on a pack.',
              },
              {
                icon: Quote,
                title: 'No promises we cannot keep',
                body: 'We talk about what is in the food. We do not claim to treat, cure or prevent any condition.',
              },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-3.5">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sage-100 text-forest">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-[14.5px] font-bold text-forest">{title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-charcoal-600">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <Badge variant="sage">FSSAI licensed kitchen</Badge>
            <Badge variant="soft">Blast-chilled, never frozen twice</Badge>
            <Badge variant="soft">Made in Hyderabad</Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
