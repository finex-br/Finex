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
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

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
          'hidden lg:flex fixed left-0 top-0 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-col transition-all duration-300 z-40',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
          {!isCollapsed && (
            <h1 className="text-2xl font-bold text-orange-600">FinEx</h1>
          )}
          {isCollapsed && (
            <span className="text-2xl font-bold text-orange-600 mx-auto">F</span>
          )}
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
              <span className="text-orange-600 dark:text-orange-400 font-semibold text-lg">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'email@example.com'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3">
              Menu
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
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  'hover:bg-slate-100 dark:hover:bg-slate-700',
                  active && 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium',
                  !active && 'text-slate-700 dark:text-slate-300',
                  isCollapsed && 'justify-center'
                )}
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
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3 mt-6">
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
                      'hover:bg-slate-100 dark:hover:bg-slate-700',
                      active && 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium',
                      !active && 'text-slate-700 dark:text-slate-300',
                      isCollapsed && 'justify-center'
                    )}
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
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'gap-2')}>
            {!isCollapsed && <span className="text-sm text-slate-600 dark:text-slate-400">Tema</span>}
            <ThemeToggle />
          </div>
          
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              'w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950',
              isCollapsed && 'px-0'
            )}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="ml-3">Sair</span>}
          </Button>

          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full"
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
          'lg:hidden fixed left-0 top-16 bottom-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-transform duration-300 z-40',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* User Info */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <span className="text-orange-600 dark:text-orange-400 font-semibold text-lg">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email || 'email@example.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3">
            Menu
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  'hover:bg-slate-100 dark:hover:bg-slate-700',
                  active && 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium',
                  !active && 'text-slate-700 dark:text-slate-300'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Admin Section - Only for ADMIN role */}
          {isAdmin && adminMenuItems.length > 0 && (
            <>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-3 mt-6">
                Administração
              </p>
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                      'hover:bg-slate-100 dark:hover:bg-slate-700',
                      active && 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-medium',
                      !active && 'text-slate-700 dark:text-slate-300'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
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
