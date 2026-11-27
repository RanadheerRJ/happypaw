import { Link } from 'react-router-dom';
import { MessageCircleQuestion } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { PageHero } from '@/components/marketing/PageHero';
import { FaqSection } from '@/components/marketing/FaqSection';
import { Button } from '@/components/ui/button';
import { faqItems } from '@/config/faqs';
import { brand } from '@/config/brand';

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

export default function FaqPage() {
  return (
    <>
      <SEO
        title="FAQ"
        description={`Answers about ${brand.name} fresh dog food — ingredients, portions, allergens, delivery, pausing and storage.`}
        path="/faq"
        jsonLd={faqJsonLd}
      />

      <PageHero
        eyebrow="Frequently asked"
        title={
          <>
            Everything you were
            <span className="font-serif italic text-sunset-600"> about to ask</span>
          </>
        }
        description="Food, portions, delivery and the awkward questions. If something is missing, our team answers email within a working day."
        align="center"
      >
        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link to="/contact">
              <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
              Ask us something else
            </Link>
          </Button>
        </div>
      </PageHero>

      <FaqSection showAllLink={false} heading="All questions" className="pt-14" />

      <section className="border-t border-grape/10 bg-sand-100/60 py-12">
        <div className="container-x flex flex-col items-center gap-3 text-center">
          <p className="max-w-xl text-[13px] leading-relaxed text-grape-800-600">
            {brand.medicalFootnote}
          </p>
          <p className="text-[11.5px] text-grape-800-400">
            Nothing on this page is a substitute for a consultation with your veterinarian.
          </p>
        </div>
      </section>
    </>
  );
}
