import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import type { ReactElement } from 'react';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { resetDb } from '@/data/mock/db';
import { dataClient } from '@/data';

import LandingPage from '@/pages/public/LandingPage';
import MenuPage from '@/pages/public/MenuPage';
import HowItWorksPage from '@/pages/public/HowItWorksPage';
import PlansPage from '@/pages/public/PlansPage';
import PlanDetailPage from '@/pages/public/PlanDetailPage';
import VetsPage from '@/pages/public/VetsPage';
import AboutPage from '@/pages/public/AboutPage';
import FaqPage from '@/pages/public/FaqPage';
import ContactPage from '@/pages/public/ContactPage';
import DeliveryAreasPage from '@/pages/public/DeliveryAreasPage';
import LegalPage from '@/pages/public/LegalPage';
import LoginPage from '@/pages/public/LoginPage';
import SignupPage from '@/pages/public/SignupPage';
import ForgotPasswordPage from '@/pages/public/ForgotPasswordPage';
import NotFoundPage from '@/pages/public/NotFoundPage';
import ForbiddenPage from '@/pages/public/ForbiddenPage';
import PortalPreviewPage from '@/pages/portal/PortalPreviewPage';

function renderPage(path: string, element: ReactElement, pattern = '*') {
  window.localStorage.clear();
  resetDb();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route path={pattern} element={element} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

describe('public pages render', () => {
  const pages: [string, ReactElement, RegExp, string?][] = [
    ['/', <LandingPage />, /real food/i],
    ['/menu', <MenuPage />, /this week in/i],
    ['/how-it-works', <HowItWorksPage />, /weekly rhythm/i],
    ['/plans', <PlansPage />, /no lock-in/i],
    ['/plans/weekly-fresh-medium', <PlanDetailPage />, /weekly fresh — medium/i, '/plans/:slug'],
    ['/vets', <VetsPage />, /with you in the loop/i],
    ['/about', <AboutPage />, /stopped eating/i],
    ['/faq', <FaqPage />, /about to ask/i],
    ['/contact', <ContactPage />, /usually in the kitchen/i],
    ['/delivery-areas', <DeliveryAreasPage />, /one delivery day/i],
    ['/legal/privacy', <LegalPage />, /privacy policy/i, '/legal/:slug'],
    ['/login', <LoginPage />, /welcome back/i],
    ['/signup', <SignupPage />, /build your dog's plan/i],
    ['/forgot-password', <ForgotPasswordPage />, /reset your password/i],
    ['/nowhere', <NotFoundPage />, /this bowl is empty/i],
    ['/403', <ForbiddenPage />, /not for your account/i],
  ];

  it.each(pages)('renders %s', async (path, element, heading, pattern) => {
    renderPage(path, element, pattern);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });
});

describe('guarded portals render for the right role', () => {
  it.each([
    ['customer', <PortalPreviewPage role="customer" />, /everything about your dog/i],
    ['vet', <PortalPreviewPage role="vet" />, /clinical visibility/i],
    ['admin', <PortalPreviewPage role="admin" />, /run the whole week/i],
  ] as const)('renders the %s portal preview', async (role, element, heading) => {
    window.localStorage.clear();
    resetDb();
    await dataClient.auth.signInAsDemo(role);
    renderPage('/portal', element);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });
});
