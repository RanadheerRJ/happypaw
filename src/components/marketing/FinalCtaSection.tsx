import { Link } from 'react-router-dom';
import { ArrowRight, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/shared/Reveal';
import { brand } from '@/config/brand';
import { deliverySchedule } from '@/config/pricing';

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden bg-forest-800 py-16 text-cream sm:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-sage-400/10 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-terracotta/15 blur-3xl" />
        <PawPrint className="absolute right-[8%] top-10 h-24 w-24 rotate-12 text-cream/[0.06]" />
        <PawPrint className="absolute bottom-8 left-[6%] h-16 w-16 -rotate-6 text-cream/[0.05]" />
      </div>

      <div className="container-x relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-300">
            Start with a trial box
          </p>
          <h2 className="mt-4 font-display text-[2.1rem] font-extrabold leading-[1.05] text-cream sm:text-4xl lg:text-5xl">
            Your dog's next meal
            <br />
            could be <span className="font-serif font-semibold italic text-sage-300">real food.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-cream/70">
            Three days for ₹299, one per household. Tell us about your dog and we will portion the
            first bowl for you.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="accent">
              <Link to="/signup">
                Build my dog's meal plan
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-cream/25 text-cream hover:bg-cream/10">
              <Link to="/menu">See this week's menu</Link>
            </Button>
          </div>
          <p className="mt-6 text-[12px] text-cream/50">
            {deliverySchedule.cutoffSummary} · Cancel or pause anytime
          </p>
          <p className="mt-2 text-[11px] text-cream/40">
            {brand.name} is a demo build — no payment is taken.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
