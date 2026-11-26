import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { RequireRole } from '@/features/auth/RequireRole';
import { dataClient } from '@/data';
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

function renderRoute(initialPath: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route
              path="/app"
              element={
                <RequireRole role="customer">
                  <p>customer area</p>
                </RequireRole>
              }
            />
            <Route
              path="/vet"
              element={
                <RequireRole role="vet">
                  <p>vet area</p>
                </RequireRole>
              }
            />
            <Route path="/login" element={<p>login screen</p>} />
            <Route path="/403" element={<p>forbidden screen</p>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('role guards', () => {
  beforeEach(async () => {
    window.localStorage.clear();
    resetFakeDb();
    await dataClient.auth.signOut().catch(() => undefined);
  });

  it('redirects signed-out visitors to login with a next param', async () => {
    renderRoute('/app');
    expect(await screen.findByText('login screen')).toBeInTheDocument();
  });

  it('allows a customer into the customer portal', async () => {
    await signInAsRole('customer');
    renderRoute('/app');
    expect(await screen.findByText('customer area')).toBeInTheDocument();
  });

  it('sends a customer away from the vet portal to 403', async () => {
    await signInAsRole('customer');
    renderRoute('/vet');
    expect(await screen.findByText('forbidden screen')).toBeInTheDocument();
  });

  it('allows a vet into the vet portal', async () => {
    await signInAsRole('vet');
    renderRoute('/vet');
    expect(await screen.findByText('vet area')).toBeInTheDocument();
  });

  it('sends a vet away from the customer portal', async () => {
    await signInAsRole('vet');
    renderRoute('/app');
    expect(await screen.findByText('forbidden screen')).toBeInTheDocument();
  });
});
