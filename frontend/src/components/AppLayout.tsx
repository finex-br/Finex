import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  FileSearch,
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  X,
  FileText,
  Shield,
  Moon,
  Sun,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * AppLayout Component
 * 
 * Layout principal com sidebar de navegação
 * - Sidebar colapsável em desktop
 * - Menu hamburguer em mobile
 * - Navegação entre páginas
 * - Botão de logout
 */
export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const isSystemAdmin = user?.role === 'ADMIN';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      id: 'upload',
      label: 'Importar Dados',
      icon: Upload,
      path: '/upload',
    },
    {
      id: 'surveys',
      label: 'Questionários',
      icon: FileText,
      path: '/surveys',
    },
    ...(!isSystemAdmin
      ? [
          {
            id: 'my-docs',
            label: 'Meus Documentos',
            icon: FileSearch,
            path: '/documents',
          },
        ]
      : []),
  ];

  // Admin menu items - only visible for ADMIN role
  const adminMenuItems = isSystemAdmin
    ? [
        {
          id: 'admin',
          label: 'Questionários',
          icon: Shield,
          path: '/admin',
        },
        {
          id: 'pending-docs',
          label: 'Revisar Documentos',
          icon: FileSearch,
          path: '/admin/pending-documents',
        },
      ]
    : [];
  
  const isAdmin = user?.role === 'ADMIN';
  
  // Debug logs
  console.log('👤 Current User:', user);
  console.log('🎭 User Role:', user?.role);
  console.log('🛡️ Is Admin?:', isAdmin);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    // Exact match
    if (location.pathname === path) return true;
    
    // For /admin route, only match exactly to avoid highlighting both buttons
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    
    // For other routes, match if pathname starts with path
    return location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <h1 className="text-xl font-bold text-orange-600">FinEx</h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Sidebar Desktop */}
      <aside
        className={cn(
          'hidden lg:flex fixed left-0 top-0 h-screen border-r flex-col transition-all duration-300 z-40',
          isCollapsed ? 'w-20' : 'w-64'
        )}
        style={{ 
          backgroundColor: theme === 'dark' ? '#0b0b14' : '#fafafa',
          borderColor: theme === 'dark' ? '#1a1a2e' : '#e5e7eb'
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b" style={{ borderColor: theme === 'dark' ? '#1a1a2e' : '#e5e7eb' }}>
          {!isCollapsed && (
            <h1 className="text-2xl font-bold" style={{ color: '#ff6600' }}>FinEx</h1>
          )}
          {isCollapsed && (
            <span className="text-2xl font-bold mx-auto" style={{ color: '#ff6600' }}>F</span>
          )}
        </div>

        {/* User Info */}
        <div className="p-4 border-b" style={{ borderColor: theme === 'dark' ? '#1a1a2e' : '#e5e7eb' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ff6600' }}>
              <span className="font-semibold text-lg" style={{ color: '#ffffff' }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate" style={{ color: theme === 'dark' ? '#ffffff' : '#0e172a' }}>
                  Singular Tech
                </p>
                <p className="text-xs truncate" style={{ color: '#77849a' }}>
                  {user?.name || 'Usuário'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-3" style={{ color: '#77849a' }}>
              Módulos
            </p>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                  active && 'border-l-2 font-medium',
                  isCollapsed && 'justify-center'
                )}
                style={{
                  color: active ? '#f96403' : '#77849a',
                  borderColor: active ? '#f96403' : 'transparent',
                  backgroundColor: active ? (theme === 'dark' ? '#211315' : '#fff3ed') : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}

          {/* Admin Button - Only for ADMIN role */}
          {isAdmin && adminMenuItems.length > 0 && (
            <>
              {!isCollapsed && (
                <div className="mt-6 mb-3 px-3">
                  <div className="border-t" style={{ borderColor: theme === 'dark' ? '#1a1a2e' : '#e5e7eb' }}></div>
                </div>
              )}
              {isCollapsed && <div className="my-3"></div>}
              {!isCollapsed && (
                <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-3" style={{ color: '#77849a' }}>
                  Administração
                </p>
              )}
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      active && 'border-l-2 font-medium',
                      isCollapsed && 'justify-center'
                    )}
                    style={{
                      color: active ? '#f96403' : '#77849a',
                      borderColor: active ? '#f96403' : 'transparent',
                      backgroundColor: active ? (theme === 'dark' ? '#211315' : '#fff3ed') : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t space-y-1" style={{ borderColor: theme === 'dark' ? '#1a1a2e' : '#e5e7eb' }}>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              isCollapsed && 'justify-center'
            )}
            style={{ color: '#77849a' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Moon className="w-5 h-5 flex-shrink-0" />
            )}
            {!isCollapsed && <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>}
          </button>

          <button
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              isCollapsed && 'justify-center'
            )}
            style={{ color: '#77849a' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Bell className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <>
                <span>Notificações</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#ff6600', color: '#ffffff' }}>
                  3
                </span>
              </>
            )}
          </button>
          
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              'w-full hover:bg-red-500/10 flex items-center gap-3 px-3 py-2.5',
              isCollapsed && 'justify-center px-0'
            )}
            style={{ color: '#ee6d70' }}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Sair</span>}
          </Button>

          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full"
            style={{ color: '#77849a' }}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="ml-2 text-sm">Recolher</span>
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-16 bottom-0 w-64 border-r flex flex-col transition-transform duration-300 z-40',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ 
          backgroundColor: theme === 'dark' ? '#0b0b14' : '#fafafa',
          borderColor: theme === 'dark' ? '#1a1a2e' : '#e5e7eb'
        }}
      >
        {/* User Info */}
        <div className="p-4 border-b" style={{ borderColor: theme === 'dark' ? '#1a1a2e' : '#e5e7eb' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ff6600' }}>
              <span className="font-semibold text-lg" style={{ color: '#ffffff' }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate" style={{ color: theme === 'dark' ? '#ffffff' : '#0e172a' }}>
                Singular Tech
              </p>
              <p className="text-xs truncate" style={{ color: '#77849a' }}>
                {user?.name || 'Usuário'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-3" style={{ color: '#77849a' }}>
            Módulos
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors border-l-2"
                style={{
                  color: active ? '#f96403' : '#77849a',
                  borderColor: active ? '#f96403' : 'transparent',
                  backgroundColor: active ? (theme === 'dark' ? '#211315' : '#fff3ed') : 'transparent',
                  fontWeight: active ? '500' : '400'
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Admin Section - Only for ADMIN role */}
          {isAdmin && adminMenuItems.length > 0 && (
            <>
              <div className="mt-6 mb-3 px-3">
                <div className="border-t" style={{ borderColor: theme === 'dark' ? '#1a1a2e' : '#e5e7eb' }}></div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-3" style={{ color: '#77849a' }}>
                Administração
              </p>
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors border-l-2"
                    style={{
                      color: active ? '#f96403' : '#77849a',
                      borderColor: active ? '#f96403' : 'transparent',
                      backgroundColor: active ? (theme === 'dark' ? '#211315' : '#fff3ed') : 'transparent',
                      fontWeight: active ? '500' : '400'
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* Bottom Buttons */}
        <div className="p-3 border-t space-y-1" style={{ borderColor: theme === 'dark' ? '#1a1a2e' : '#e5e7eb' }}>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
            style={{ color: '#77849a' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            <span>{theme === "dark" ? "Modo Claro" : "Modo Escuro"}</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
            style={{ color: '#77849a' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Bell className="w-5 h-5" />
            <span>Notificações</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#ff6600', color: '#ffffff' }}>
              3
            </span>
          </button>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start hover:bg-red-500/10 px-3 py-2.5"
            style={{ color: '#ee6d70' }}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'transition-all duration-300',
          'pt-16 lg:pt-0', // Add padding-top on mobile for fixed header
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        {children}
      </main>
    </div>
  );
}
