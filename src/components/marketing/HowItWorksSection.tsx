import { MessageSquareHeart, Scale, ChefHat, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { RevealGroup, RevealItem } from '@/components/shared/Reveal';
import { Button } from '@/components/ui/button';
import { deliverySchedule } from '@/config/pricing';

const steps = [
  {
    icon: MessageSquareHeart,
    title: 'Tell us about your dog',
    body: 'Weight, age, activity, allergies and what they eat now. Takes about two minutes.',
    meta: '2 min',
  },
  {
    icon: Scale,
    title: 'We portion it',
    body: 'Your dog gets daily grams split across two meals, adjusted by body condition and reviewed by vets on request.',
    meta: 'Portion card',
  },
  {
    icon: ChefHat,
    title: 'We cook it fresh',
    body: 'Small batches in our Hyderabad kitchen, gently cooked and blast-chilled the same morning.',
    meta: 'Every Saturday',
  },
  {
    icon: Truck,
    title: 'We deliver weekly',
    body: 'Insulated, chilled and portioned — on your doorstep Sunday between 7 AM and 12 PM.',
    meta: deliverySchedule.deliveryWindow,
  },
];

export function HowItWorksSection() {
  return (
    <section className="section">
      <div className="container-x">
        <SectionHeading
          eyebrow="How it works"
          title="From your dog's details to their bowl"
          description="One simple weekly rhythm. Switch, pause or skip from your account whenever life changes."
          align="center"
        />

        <RevealGroup className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden="true"
            className="absolute left-[12%] right-[12%] top-[42px] hidden border-t border-dashed border-forest/20 lg:block"
          />
          {steps.map(({ icon: Icon, title, body, meta }, index) => (
            <RevealItem key={title}>
              <div className="relative h-full rounded-3xl border border-forest/10 bg-white p-6 text-center shadow-soft transition-transform duration-300 hover:-translate-y-1">
                <div className="relative mx-auto grid h-[68px] w-[68px] place-items-center rounded-full border border-sage-200 bg-sage-50">
                  <Icon className="h-6 w-6 text-forest" aria-hidden="true" />
                  <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-terracotta text-[10px] font-bold text-white shadow-soft">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-[16px] font-bold text-forest">{title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-charcoal-600">{body}</p>
                <p className="mt-4 inline-flex rounded-full bg-cream-200/80 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-forest-600">
                  {meta}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" variant="outline">
            <Link to="/how-it-works">
              See the full process <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <p className="text-[12.5px] text-charcoal-500">{deliverySchedule.summary}</p>
        </div>
      </div>
    </section>
  );
}
