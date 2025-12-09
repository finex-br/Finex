import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { FinancialProvider } from "./context/FinancialContext";
import { LandingView } from "./views/LandingView";
import { LoginView } from "./views/LoginView";
import { SignUpView } from "./views/SignUpView";
import { UploadView } from "./views/UploadView";
import { DashboardView } from "./views/DashboardView";

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
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    // Redireciona para login se não houver token (replace evita loop no histórico)
    return <Navigate to="/login" replace />;
  }
  
  // Renderiza os filhos se o usuário estiver autenticado
  return <>{children}</>;
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <FinancialProvider>
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
              
              {/* Rota Protegida - Upload */}
              <Route 
                path="/upload" 
                element={
                  <ProtectedRoute>
                    <UploadView />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rota Protegida - Dashboard */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardView />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all - Redireciona para a home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </FinancialProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
