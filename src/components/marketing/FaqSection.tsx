import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Reveal } from '@/components/shared/Reveal';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Button } from '@/components/ui/button';
import { faqItems } from '@/config/faqs';
import { cn } from '@/lib/utils';

export function FaqSection({
  limit,
  showAllLink = true,
  className,
  heading = 'Questions, answered',
}: {
  limit?: number;
  showAllLink?: boolean;
  className?: string;
  heading?: string;
}) {
  const items = limit ? faqItems.slice(0, limit) : faqItems;

  return (
    <section className={cn('section bg-white', className)} id="faq">
      <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="FAQ"
            title={heading}
            description="Everything about the food, the plan and the Sunday delivery. Still unsure? Talk to us."
          />
          {showAllLink && (
            <Reveal delay={0.1} className="mt-6">
              <Button asChild variant="outline">
                <Link to="/faq">
                  All questions <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.05}>
          <Accordion type="single" collapsible className="rounded-3xl border border-grape/10 bg-sand-50 px-5 sm:px-6">
            {items.map((item, index) => (
              <AccordionItem key={item.question} value={`item-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
