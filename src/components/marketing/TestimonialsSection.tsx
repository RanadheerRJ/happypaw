import { Star } from 'lucide-react';
import { PhotoMarquee } from '@/components/marketing/PhotoMarquee';
import { Reveal, RevealGroup, RevealItem } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Badge } from '@/components/ui/badge';

const testimonials = [
  {
    quote:
      'Coco used to sniff at her bowl and walk away. Now she sits by the fridge at 7 pm waiting. The portion card made it easy to stop guessing.',
    name: 'Priya R.',
    area: 'Gachibowli',
    dog: 'Coco, Indie · 18 kg',
  },
  {
    quote:
      'The packaging arrives properly cold and the ingredients are visible. As a vet I like that I can see exactly what is in the bowl and adjust the grams.',
    name: 'Dr. Meera I.',
    area: 'Jubilee Hills',
    dog: 'Partner vet',
  },
  {
    quote:
      'We started with the trial box because ₹299 felt like a fair test. Two months later Biscuit has stopped begging at our plates and is finally losing the extra weight.',
    name: 'Arjun M.',
    area: 'Narsingi',
    dog: 'Biscuit, Beagle · 15 kg',
  },
];

export function TestimonialsSection() {
  return (
    <section className="section bg-sand">
      <div className="container-x">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Loved by Hyderabad dogs"
            title="Empty bowls across the city"
            description="Real-sounding quotes from our demo dataset — written to show the kind of feedback the product is designed for."
          />
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">Demo testimonials</Badge>
            <Badge variant="soft">Not real customer reviews</Badge>
          </div>
        </div>

        <RevealGroup className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <RevealItem key={item.name}>
              <figure className="flex h-full flex-col rounded-3xl border border-grape/10 bg-white p-6 shadow-soft">
                <div className="flex items-center gap-0.5 text-sunset-600" aria-label="Rated 5 out of 5 (demo)">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[14px] leading-relaxed text-grape-800-700">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-5 border-t border-grape/10 pt-4">
                  <p className="font-display text-[13.5px] font-bold text-grape-700">{item.name}</p>
                  <p className="text-[11.5px] text-grape-800-500">
                    {item.area} · {item.dog}
                  </p>
                </figcaption>
              </figure>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-12">
          <PhotoMarquee />
        </Reveal>
      </div>
    </section>
  );
}
