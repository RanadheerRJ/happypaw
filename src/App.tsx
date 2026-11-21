import { lazy, useEffect } from 'react';
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

                  <Route
                    path="app"
                    element={
                      <RequireRole role="customer">
                        <PortalPreviewPage role="customer" />
                      </RequireRole>
                    }
                  />
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

                  <Route path="403" element={<ForbiddenPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
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
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
