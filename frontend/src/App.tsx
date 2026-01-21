import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LandingView } from "./views/LandingView";
import { LoginView } from "./views/LoginView";
import { SignUpView } from "./views/SignUpView";
import { UploadView } from "./views/UploadView";
import { DashboardView } from "./views/DashboardView";
import { GoogleCallbackView } from "./views/GoogleCallbackView";
import { SurveysListView } from "./views/SurveysListView";
import { SurveyQuestionnaireView } from "./views/SurveyQuestionnaireView";
import { AdminPanelView } from "./views/AdminPanelView";
import { PendingDocumentsAdminView } from "./views/PendingDocumentsAdminView";
import { PendingDocumentAdminDetailView } from "./views/PendingDocumentAdminDetailView";
import { CompanySetupView } from "./views/CompanySetupView";
import { MyDocumentsView } from "./views/MyDocumentsView";
import { MyDocumentDetailView } from "./views/MyDocumentDetailView";
import { useAuthStore } from "./store/authStore";

const queryClient = new QueryClient();

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

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rota Pública - Landing Page */}
            <Route path="/" element={<LandingView />} />
            
            {/* Rota Pública - Login */}
            <Route path="/login" element={<LoginView />} />
            
            {/* Rota Pública - Cadastro */}
            <Route path="/signup" element={<SignUpView />} />
            
            {/* OAuth DESABILITADO - Rota de callback removida */}
            {/* <Route path="/auth/google/callback" element={<GoogleCallbackView />} /> */}
            
            {/* Rota Protegida - Upload */}
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute requireCompany>
                  <UploadView />
                </ProtectedRoute>
              } 
            />
            
            {/* Rota Protegida - Dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requireCompany>
                  <DashboardView />
                </ProtectedRoute>
              } 
            />
            
            {/* Rota Protegida - Lista de Surveys */}
            <Route 
              path="/surveys" 
              element={
                <ProtectedRoute requireCompany>
                  <SurveysListView />
                </ProtectedRoute>
              } 
            />
            
            {/* Rota Protegida - Questionário */}
            <Route 
              path="/surveys/:assessmentId" 
              element={
                <ProtectedRoute requireCompany>
                  <SurveyQuestionnaireView />
                </ProtectedRoute>
              } 
            />

            {/* Rota Protegida - Admin Pending Documents */}
            <Route 
              path="/admin/pending-documents" 
              element={
                <AdminRoute>
                  <PendingDocumentsAdminView />
                </AdminRoute>
              }
            />

            {/* Rota Protegida - Admin Pending Document Detail */}
            <Route 
              path="/admin/pending-documents/:id" 
              element={
                <AdminRoute>
                  <PendingDocumentAdminDetailView />
                </AdminRoute>
              }
            />

            {/* Rota Protegida - Company Setup */}
            <Route
              path="/company/setup"
              element={
                <ProtectedRoute>
                  <CompanySetupView />
                </ProtectedRoute>
              }
            />

            {/* Rota Protegida - Company Member: acompanhar documentos */}
            <Route
              path="/documents"
              element={
                <ProtectedRoute requireCompany>
                  <MyDocumentsView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents/:id"
              element={
                <ProtectedRoute requireCompany>
                  <MyDocumentDetailView />
                </ProtectedRoute>
              }
            />
            
            {/* Rota Protegida - Admin Panel (somente ADMIN) */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPanelView />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all - Redireciona para a home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
