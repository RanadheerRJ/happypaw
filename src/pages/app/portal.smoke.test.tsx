import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import type { ReactElement } from 'react';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { RequireRole } from '@/features/auth/RequireRole';
import { resetFakeDb, signInAsRole } from '@/test/fakeDataClient';

vi.mock('@/data', async (importOriginal) => {
  const { fakeDataClient } = await import('@/test/fakeDataClient');
  const actual = await importOriginal<typeof import('@/data')>();
  return {
    ...actual,
    dataClient: fakeDataClient,
    subscribeAuthState: () => () => undefined,
  };
});

import OverviewPage from '@/pages/app/OverviewPage';
import DogsPage from '@/pages/app/DogsPage';
import SubscribePage from '@/pages/app/SubscribePage';
import SubscriptionsPage from '@/pages/app/SubscriptionsPage';
import OrdersPage from '@/pages/app/OrdersPage';
import DeliveriesPage from '@/pages/app/DeliveriesPage';
import SupportPage from '@/pages/app/SupportPage';
import SettingsPage from '@/pages/app/SettingsPage';

function renderRaw(node: ReactElement, path = '/app') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 } },
  });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

function renderPortal(element: ReactElement, path = '/app', pattern = '/app/*') {
  return renderRaw(
    <Routes>
      <Route path={pattern} element={element} />
    </Routes>,
    path,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  resetFakeDb();
});

describe('customer portal smoke test', () => {
  const pages: [string, ReactElement, RegExp, string?][] = [
    ['/app', <OverviewPage />, /good (morning|afternoon|evening), priya/i],
    ['/app/dogs', <DogsPage />, /every dog gets their own plan/i],
    ['/app/subscribe', <SubscribePage />, /build your weekly box/i],
    ['/app/subscriptions', <SubscriptionsPage />, /your weekly rhythm/i],
    ['/app/orders', <OrdersPage />, /orders and invoices/i],
    ['/app/deliveries', <DeliveriesPage />, /sunday, sorted/i],
    ['/app/support', <SupportPage />, /talk to a human/i],
    ['/app/settings', <SettingsPage />, /your account/i],
  ];

  it.each(pages)('renders %s for a signed-in customer', async (path, element, heading) => {
    await signInAsRole('customer');
    renderPortal(element, path);
    expect(await screen.findByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });
});

describe('role guard', () => {
  it('sends signed-out visitors to the login screen', async () => {
    renderRaw(
      <Routes>
        <Route path="/login" element={<h1>Sign in screen</h1>} />
        <Route
          path="/app"
          element={
            <RequireRole role="customer">
              <h1>Customer home</h1>
            </RequireRole>
          }
        />
      </Routes>,
    );

    expect(await screen.findByRole('heading', { name: /sign in screen/i })).toBeInTheDocument();
  });

  it('sends the wrong role to the 403 screen', async () => {
    await signInAsRole('vet');
    renderRaw(
      <Routes>
        <Route path="/403" element={<h1>Forbidden screen</h1>} />
        <Route
          path="/app"
          element={
            <RequireRole role="customer">
              <h1>Customer home</h1>
            </RequireRole>
          }
        />
      </Routes>,
    );

    expect(await screen.findByRole('heading', { name: /forbidden screen/i })).toBeInTheDocument();
  });

  it('renders the guarded page for the matching role', async () => {
    await signInAsRole('customer');
    renderRaw(
      <Routes>
        <Route
          path="/app"
          element={
            <RequireRole role="customer">
              <h1>Customer home</h1>
            </RequireRole>
          }
        />
      </Routes>,
    );

    expect(await screen.findByRole('heading', { name: /customer home/i })).toBeInTheDocument();
  });
});
