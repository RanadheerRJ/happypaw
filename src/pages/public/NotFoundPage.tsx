import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Home, UtensilsCrossed } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { PawMark } from '@/components/shared/Logo';
import { brand } from '@/config/brand';

export default function NotFoundPage() {
  return (
    <>
      <SEO
        title="Page not found"
        description="That page does not exist. Head back to the Happy Paw home page."
        path="/404"
        noIndex
      />
      <section className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <div className="relative">
          <p className="font-display text-[6rem] font-extrabold leading-none text-forest/[0.08] sm:text-[9rem]">
            404
          </p>
          <PawMark className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 opacity-80" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-forest sm:text-3xl">
          This bowl is empty
        </h1>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-charcoal-600">
          The page you were looking for has moved, or never existed. Let's get you back to something
          useful — the menu is a good place to start.
        </p>
        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <Button asChild size="lg">
            <Link to="/">
              <Home className="h-4 w-4" aria-hidden="true" /> Back to home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/menu">
              <UtensilsCrossed className="h-4 w-4" aria-hidden="true" /> This week's menu
            </Link>
          </Button>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] text-charcoal-500">
          <Link to="/plans" className="inline-flex items-center gap-1 hover:text-forest">
            Plans &amp; pricing <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
          <Link to="/delivery-areas" className="inline-flex items-center gap-1 hover:text-forest">
            Delivery areas <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
          <a href={`mailto:${brand.email}`} className="inline-flex items-center gap-1 hover:text-forest">
            Contact support <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
        <p className="mt-8 inline-flex items-center gap-1.5 text-[11px] text-charcoal-400">
          <Compass className="h-3 w-3" aria-hidden="true" /> Error 404 · page not found
        </p>
      </section>
    </>
  );
}
