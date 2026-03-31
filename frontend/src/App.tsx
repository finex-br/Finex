import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import * as Sentry from '@sentry/react';
import { AnimatePresence, motion } from 'framer-motion';
import { SentryErrorFallback } from './components/SentryErrorFallback';
import { LandingView } from "./views/LandingView";
import { LoginView } from "./views/LoginView";
import { SignUpView } from "./views/SignUpView";
import { UploadView } from "./views/UploadView";
import { DashboardView } from "./views/DashboardView";
import { GoogleCallbackView } from "./views/GoogleCallbackView";
import { SurveysListView } from "./views/SurveysListView";
import { SurveyQuestionnaireView } from "./views/SurveyQuestionnaireView";
import { SurveyResponsesView } from "./views/SurveyResponsesView";
import { AdminPanelView } from "./views/AdminPanelView";
import { PendingDocumentsAdminView } from "./views/PendingDocumentsAdminView";
import { PendingDocumentAdminDetailView } from "./views/PendingDocumentAdminDetailView";
import { CompanySetupView } from "./views/CompanySetupView";
import { MyDocumentsView } from "./views/MyDocumentsView";
import { MyDocumentDetailView } from "./views/MyDocumentDetailView";
import { DatasetManagementView } from "./views/admin/DatasetManagementView";
import { ChartBuilderView } from "./views/admin/ChartBuilderView";
import { DashboardListView } from "./views/admin/DashboardListView";
import { DashboardConfigView } from "./views/admin/DashboardConfigView";
import { DynamicDashboardView } from "./views/DynamicDashboardView";
import { PrivacyView } from "./views/PrivacyView";
import { TermsView } from "./views/TermsView";
import { useAuthStore } from "./store/authStore";

const queryClient = new QueryClient();

const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);

/**
 * ProtectedRoute - Componente de Rota Protegida
 * 
 * Verifica se o usuário está autenticado através do token no localStorage.
 * Se não estiver autenticado, redireciona para a página de login.
 * 
 * @param children - Componentes filhos a serem renderizados se autenticado
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireCompany?: boolean;
}

const ProtectedRoute = ({ children, requireCompany }: ProtectedRouteProps) => {
  const token = localStorage.getItem('access_token');
  const companyId = localStorage.getItem('current_company_id');
  
  if (!token) {
    // Redireciona para login se não houver token (replace evita loop no histórico)
    return <Navigate to="/login" replace />;
  }

  if (requireCompany && !companyId) {
    return <Navigate to="/company/setup" replace />;
  }
  
  // Renderiza os filhos se o usuário estiver autenticado
  return <>{children}</>;
};

const AdminRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem('access_token');
  const userRole = useAuthStore((s) => s.user?.role);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <SentryRoutes location={location} key={location.pathname}>
            {/* Rota Pública - Landing Page */}
            <Route path="/" element={<PageTransition><LandingView /></PageTransition>} />

            {/* Rota Pública - Login */}
            <Route path="/login" element={<PageTransition><LoginView /></PageTransition>} />

            {/* Rota Pública - Cadastro */}
            <Route path="/signup" element={<PageTransition><SignUpView /></PageTransition>} />

            {/* Rotas Públicas - Privacidade e Termos */}
            <Route path="/privacy" element={<PageTransition><PrivacyView /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><TermsView /></PageTransition>} />

            {/* Rota Protegida - Upload */}
            <Route
              path="/upload"
              element={
                <ProtectedRoute requireCompany>
                  <PageTransition><UploadView /></PageTransition>
                </ProtectedRoute>
              }
            />

            {/* Rota Protegida - Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireCompany>
                  <PageTransition><DashboardView /></PageTransition>
                </ProtectedRoute>
              }
            />

            {/* Rota Protegida - Lista de Surveys */}
            <Route
              path="/surveys"
              element={
                <ProtectedRoute requireCompany>
                  <PageTransition><SurveysListView /></PageTransition>
                </ProtectedRoute>
              }
            />

            {/* Rota Protegida - Ver Respostas */}
            <Route
              path="/surveys/:assessmentId/responses"
              element={
                <ProtectedRoute requireCompany>
                  <PageTransition><SurveyResponsesView /></PageTransition>
                </ProtectedRoute>
              }
            />

            {/* Rota Protegida - Questionário */}
            <Route
              path="/surveys/:assessmentId"
              element={
                <ProtectedRoute requireCompany>
                  <PageTransition><SurveyQuestionnaireView /></PageTransition>
                </ProtectedRoute>
              }
            />

            {/* Rota Protegida - Admin Pending Documents */}
            <Route
              path="/admin/pending-documents"
              element={
                <AdminRoute>
                  <PageTransition><PendingDocumentsAdminView /></PageTransition>
                </AdminRoute>
              }
            />

            {/* Rota Protegida - Admin Pending Document Detail */}
            <Route
              path="/admin/pending-documents/:id"
              element={
                <AdminRoute>
                  <PageTransition><PendingDocumentAdminDetailView /></PageTransition>
                </AdminRoute>
              }
            />

            {/* Rota Protegida - Company Setup */}
            <Route
              path="/company/setup"
              element={
                <ProtectedRoute>
                  <PageTransition><CompanySetupView /></PageTransition>
                </ProtectedRoute>
              }
            />

            {/* Rota Protegida - Company Member: acompanhar documentos */}
            <Route
              path="/documents"
              element={
                <ProtectedRoute requireCompany>
                  <PageTransition><MyDocumentsView /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents/:id"
              element={
                <ProtectedRoute requireCompany>
                  <PageTransition><MyDocumentDetailView /></PageTransition>
                </ProtectedRoute>
              }
            />

            {/* Rota Protegida - Admin Panel */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <PageTransition><AdminPanelView /></PageTransition>
                </ProtectedRoute>
              }
            />

            {/* Admin Analytics - Datasets */}
            <Route
              path="/admin/datasets"
              element={
                <AdminRoute>
                  <PageTransition><DatasetManagementView /></PageTransition>
                </AdminRoute>
              }
            />

            {/* Admin Analytics - Dashboards */}
            <Route
              path="/admin/dashboards"
              element={
                <AdminRoute>
                  <PageTransition><DashboardListView /></PageTransition>
                </AdminRoute>
              }
            />

            {/* Admin Analytics - Dashboard Config */}
            <Route
              path="/admin/dashboards/:id/config"
              element={
                <AdminRoute>
                  <PageTransition><DashboardConfigView /></PageTransition>
                </AdminRoute>
              }
            />

            {/* Admin Analytics - Chart Builder */}
            <Route
              path="/admin/chart-builder"
              element={
                <AdminRoute>
                  <PageTransition><ChartBuilderView /></PageTransition>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/chart-builder/:chartId"
              element={
                <AdminRoute>
                  <PageTransition><ChartBuilderView /></PageTransition>
                </AdminRoute>
              }
            />

            {/* Dynamic Dashboard */}
            <Route
              path="/dynamic-dashboard/:dashboardId"
              element={
                <ProtectedRoute>
                  <PageTransition><DynamicDashboardView /></PageTransition>
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
      </SentryRoutes>
    </AnimatePresence>
  );
}

const App = () => (
  <Sentry.ErrorBoundary fallback={SentryErrorFallback}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </Sentry.ErrorBoundary>
);

export default App;
