import { SEO } from '@/components/shared/SEO';
import { HeroSection } from '@/components/marketing/HeroSection';
import { WhyFreshSection } from '@/components/marketing/WhyFreshSection';
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection';
import { MenuPreviewSection } from '@/components/marketing/MenuPreviewSection';
import { PlansPreviewSection } from '@/components/marketing/PlansPreviewSection';
import { VetTrustSection } from '@/components/marketing/TrustSection';
import { TestimonialsSection } from '@/components/marketing/TestimonialsSection';
import { DeliverySection } from '@/components/marketing/DeliverySection';
import { FaqSection } from '@/components/marketing/FaqSection';
import { FinalCtaSection } from '@/components/marketing/FinalCtaSection';
import { brand } from '@/config/brand';
import { faqItems } from '@/config/faqs';

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: brand.name,
  description: brand.description,
  slogan: brand.tagline,
  url: brand.domain,
  email: brand.email,
  telephone: brand.phone,
  priceRange: '₹₹',
  servesCuisine: 'Fresh dog food',
  areaServed: { '@type': 'City', name: brand.city },
  address: {
    '@type': 'PostalAddress',
    streetAddress: brand.address.line1,
    addressLocality: brand.address.city,
    addressRegion: brand.address.state,
    postalCode: brand.address.pincode,
    addressCountry: 'IN',
  },
  openingHours: 'Mo-Sa 09:00-19:00',
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.slice(0, 8).map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

export default function LandingPage() {
  return (
    <>
      <SEO jsonLd={[localBusinessJsonLd, faqJsonLd]} />
      <HeroSection />
      <WhyFreshSection />
      <HowItWorksSection />
      <MenuPreviewSection />
      <PlansPreviewSection />
      <VetTrustSection />
      <TestimonialsSection />
      <DeliverySection />
      <FaqSection limit={7} />
      <FinalCtaSection />
    </>
  );
}
