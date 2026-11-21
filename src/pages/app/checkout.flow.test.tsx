import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { resetDb } from '@/data/mock/db';
import { dataClient } from '@/data';
import SubscribePage from '@/pages/app/SubscribePage';

function renderCheckout() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 0 } },
  });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={['/app/subscribe']}>
            <Routes>
              <Route path="/app/subscribe" element={<SubscribePage />} />
              <Route path="/app/dogs/new" element={<h1>Add dog screen</h1>} />
              <Route path="/app/orders/:orderId" element={<h1>Order screen</h1>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  resetDb();
});

describe('customer checkout flow', () => {
  it('walks dog → plan → delivery → review and completes a simulated payment', async () => {
    const user = userEvent.setup();
    await dataClient.auth.signInAsDemo('customer');
    renderCheckout();

    expect(
      await screen.findByRole('heading', { level: 1, name: /build your weekly box/i }),
    ).toBeInTheDocument();

    // Step 1 — dog. Wait for the seeded dogs to load, then continue.
    const continueButton = await screen.findByRole('button', { name: /continue/i });
    await waitFor(() => expect(continueButton).toBeEnabled(), { timeout: 5000 });
    await user.click(continueButton);

    // Step 2 — plan: a recommended weekly plan is preselected.
    expect(await screen.findByRole('heading', { name: /choose a plan/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled(), {
      timeout: 5000,
    });

    // Apply a coupon before leaving this step? Coupons live on the delivery step.
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 3 — delivery: default address + coupon.
    expect(await screen.findByRole('heading', { name: /delivery address/i })).toBeInTheDocument();
    const couponInput = screen.getByLabelText(/coupon code/i);
    await user.type(couponInput, 'FIRSTPAW');
    await user.click(screen.getByRole('button', { name: /^apply$/i }));
    expect(
      await screen.findByText(/firstpaw applied/i, undefined, { timeout: 5000 }),
    ).toBeInTheDocument();

    await waitFor(() => expect(screen.getByRole('button', { name: /continue/i })).toBeEnabled(), {
      timeout: 5000,
    });
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 4 — review and pay.
    expect(await screen.findByRole('heading', { name: /^review$/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /pay .*simulated/i }));

    expect(await screen.findByRole('heading', { name: /complete your payment/i })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: /pay now/i }));

    expect(
      await screen.findByRole('heading', { name: /booked in for sunday/i, level: 1 }, { timeout: 6000 }),
    ).toBeInTheDocument();

    const orders = await dataClient.orders.list('user-customer');
    const fresh = orders.find((order) => order.discountInr > 0);
    expect(fresh).toBeDefined();
    expect(fresh?.payment?.status).toBe('simulated');
  }, 30_000);
});
