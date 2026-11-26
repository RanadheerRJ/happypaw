import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';
import { PageTransition } from '@/components/shared/Reveal';
import { RouteFallback } from '@/components/shared/RouteFallback';

export function PublicLayout() {
  const location = useLocation();

  function handleSkip(event: React.MouseEvent<HTMLAnchorElement>) {
    // HashRouter owns the URL hash, so scroll manually instead of following the href.
    event.preventDefault();
    const main = document.getElementById('main-content');
    main?.focus();
    main?.scrollIntoView({ block: 'start' });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" onClick={handleSkip} className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Suspense fallback={<RouteFallback />}>
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
