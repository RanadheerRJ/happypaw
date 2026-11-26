import { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter,
  HashRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { RouteFallback } from '@/components/shared/RouteFallback';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { RequireRole } from '@/features/auth/RequireRole';
import { env } from '@/config/env';

const LandingPage = lazy(() => import('@/pages/public/LandingPage'));
const MenuPage = lazy(() => import('@/pages/public/MenuPage'));
const HowItWorksPage = lazy(() => import('@/pages/public/HowItWorksPage'));
const PlansPage = lazy(() => import('@/pages/public/PlansPage'));
const PlanDetailPage = lazy(() => import('@/pages/public/PlanDetailPage'));
const VetsPage = lazy(() => import('@/pages/public/VetsPage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const FaqPage = lazy(() => import('@/pages/public/FaqPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const DeliveryAreasPage = lazy(() => import('@/pages/public/DeliveryAreasPage'));
const LegalPage = lazy(() => import('@/pages/public/LegalPage'));
const LoginPage = lazy(() => import('@/pages/public/LoginPage'));
const SignupPage = lazy(() => import('@/pages/public/SignupPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/public/ForgotPasswordPage'));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));
const ForbiddenPage = lazy(() => import('@/pages/public/ForbiddenPage'));
const PortalPreviewPage = lazy(() => import('@/pages/portal/PortalPreviewPage'));
const PortalLayout = lazy(() =>
  import('@/components/app/PortalLayout').then((module) => ({ default: module.PortalLayout })),
);
const OverviewPage = lazy(() => import('@/pages/app/OverviewPage'));
const DogsPage = lazy(() => import('@/pages/app/DogsPage'));
const DogDetailPage = lazy(() => import('@/pages/app/DogDetailPage'));
const NewDogPage = lazy(() =>
  import('@/pages/app/DogWizardPages').then((module) => ({ default: module.NewDogPage })),
);
const EditDogPage = lazy(() =>
  import('@/pages/app/DogWizardPages').then((module) => ({ default: module.EditDogPage })),
);
const SubscribePage = lazy(() => import('@/pages/app/SubscribePage'));
const SubscriptionsPage = lazy(() => import('@/pages/app/SubscriptionsPage'));
const SubscriptionDetailPage = lazy(() => import('@/pages/app/SubscriptionDetailPage'));
const OrdersPage = lazy(() => import('@/pages/app/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/pages/app/OrderDetailPage'));
const DeliveriesPage = lazy(() => import('@/pages/app/DeliveriesPage'));
const SupportPage = lazy(() => import('@/pages/app/SupportPage'));
const TicketDetailPage = lazy(() => import('@/pages/app/TicketDetailPage'));
const SettingsPage = lazy(() => import('@/pages/app/SettingsPage'));
const PortalNotFoundPage = lazy(() => import('@/pages/app/PortalNotFoundPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

const Router = env.routerMode === 'browser' ? BrowserRouter : HashRouter;

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ErrorBoundary>
            <Router>
            <ScrollToTop />
              <Routes>
                <Route element={<PublicLayout />}>
                  <Route index element={<LandingPage />} />
                  <Route path="menu" element={<MenuPage />} />
                  <Route path="how-it-works" element={<HowItWorksPage />} />
                  <Route path="plans" element={<PlansPage />} />
                  <Route path="plans/:slug" element={<PlanDetailPage />} />
                  <Route path="vets" element={<VetsPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="faq" element={<FaqPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="delivery-areas" element={<DeliveryAreasPage />} />
                  <Route path="legal/:slug" element={<LegalPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="signup" element={<SignupPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="reset-password" element={<ForgotPasswordPage />} />

                  <Route path="403" element={<ForbiddenPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                <Route
                  path="app"
                  element={
                    <RequireRole role="customer">
                      <Suspense fallback={<RouteFallback />}>
                        <PortalLayout />
                      </Suspense>
                    </RequireRole>
                  }
                >
                  <Route index element={<OverviewPage />} />
                  <Route path="dogs" element={<DogsPage />} />
                  <Route path="dogs/new" element={<NewDogPage />} />
                  <Route path="dogs/:dogId" element={<DogDetailPage />} />
                  <Route path="dogs/:dogId/edit" element={<EditDogPage />} />
                  <Route path="subscribe" element={<SubscribePage />} />
                  <Route path="subscriptions" element={<SubscriptionsPage />} />
                  <Route
                    path="subscriptions/:subscriptionId"
                    element={<SubscriptionDetailPage />}
                  />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="orders/:orderId" element={<OrderDetailPage />} />
                  <Route path="deliveries" element={<DeliveriesPage />} />
                  <Route path="support" element={<SupportPage />} />
                  <Route path="support/:ticketId" element={<TicketDetailPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<PortalNotFoundPage />} />
                </Route>

                <Route
                  path="vet"
                  element={
                    <RequireRole role="vet">
                      <PortalPreviewPage role="vet" />
                    </RequireRole>
                  }
                />
                <Route
                  path="admin"
                  element={
                    <RequireRole role="admin">
                      <PortalPreviewPage role="admin" />
                    </RequireRole>
                  }
                />
              </Routes>
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: '#1F3D2B',
                  color: '#FBF7F0',
                  border: '1px solid rgba(251,247,240,0.12)',
                  borderRadius: '14px',
                  fontFamily: 'Inter Variable, sans-serif',
                  fontSize: '13px',
                },
              }}
            />
            </Router>
          </ErrorBoundary>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
