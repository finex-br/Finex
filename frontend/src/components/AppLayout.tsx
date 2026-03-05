import { ReactNode, useState, useEffect } from 'react';
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
  Database,
  BarChart3,
  Sun,
  Moon,
  Settings,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { CompanySwitcher } from '@/components/CompanySwitcher';
import { useAuthStore } from '@/store/authStore';
import { companyService } from '@/services/companyService';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: ReactNode;
}

const PREFERRED_THEME_KEY = 'finex-preferred-theme';

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, clearAuth } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState(
    () => localStorage.getItem('finex-company-name') || 'FinEx'
  );

  const isSystemAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    companyService.getMyCompany().then(res => {
      if (res.company) {
        setCompanyName(res.company.name);
        localStorage.setItem('finex-company-name', res.company.name);
      }
    }).catch(() => {});
  }, []);

  // Apply preferred theme on mount
  useEffect(() => {
    const saved = localStorage.getItem(PREFERRED_THEME_KEY);
    if (saved) {
      setTheme(saved);
    }
  }, [setTheme]);

  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(PREFERRED_THEME_KEY, newTheme);
    setTheme(newTheme);
  };

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
        {
          id: 'admin-datasets',
          label: 'Datasets',
          icon: Database,
          path: '/admin/datasets',
        },
        {
          id: 'admin-dashboards',
          label: 'Dashboards',
          icon: BarChart3,
          path: '/admin/dashboards',
        },
      ]
    : [];

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (location.pathname === path) return true;
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(`${path}/`);
  };

  const companyInitial = 'F';

  const renderNavItems = (items: typeof menuItems, collapsed: boolean) =>
    items.map((item) => {
      const Icon = item.icon;
      const active = isActive(item.path);
      return (
        <button
          key={item.id}
          onClick={() => handleNavigation(item.path)}
          className={cn(
            'w-full sidebar-item text-sm',
            active && 'sidebar-item-active',
            collapsed && 'justify-center px-2'
          )}
        >
          <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-primary')} />
          {!collapsed && <span className="font-medium truncate">{item.label}</span>}
        </button>
      );
    });

  const optionsDropdown = (collapsed: boolean) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn('w-full sidebar-item text-sm', collapsed && 'justify-center px-2')}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Opções</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-56">
        <DropdownMenuLabel>Preferências</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Theme toggle (also saves as default) */}
        <DropdownMenuItem onClick={handleToggleTheme}>
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 mr-2" />
          ) : (
            <Moon className="w-4 h-4 mr-2" />
          )}
          {theme === 'dark' ? 'Claro' : 'Escuro'}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">{companyInitial}</span>
            </div>
            <span className="text-lg font-bold text-foreground">{companyName}</span>
          </div>
        </div>
      </header>

      {/* Sidebar Desktop */}
      <aside
        className={cn(
          'hidden lg:flex fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex-col transition-all duration-300 z-40 overflow-hidden',
          isCollapsed ? 'w-20' : 'w-64'
        )}
        style={{ 
          backgroundColor: theme === 'dark' ? '#0b0b14' : '#fafafa',
          borderColor: theme === 'dark' ? '#1a1a2e' : '#e5e7eb'
        }}
      >
        {/* Company Info */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-lg">{companyInitial}</span>
            </div>
            <div className={cn(
              "min-w-0 flex-1 overflow-hidden transition-all duration-300",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
              <h1 className="text-base font-bold text-foreground truncate">
                {companyName}
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                {user?.name?.split(' ')[0] || 'Usuário'}
              </p>
            </div>
          </div>
        </div>

        {/* Company Switcher */}
        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
          <CompanySwitcher isCollapsed={isCollapsed} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-4">
              Módulos
            </p>
          )}
          {renderNavItems(menuItems, isCollapsed)}

          {isSystemAdmin && adminMenuItems.length > 0 && (
            <>
              {!isCollapsed && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-4 mt-6">
                  Administração
                </p>
              )}
              {renderNavItems(adminMenuItems, isCollapsed)}
            </>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-sidebar-border">
          {optionsDropdown(isCollapsed)}
        </div>
      </aside>

      {/* Collapse Toggle - Outside aside to avoid overflow-hidden clipping */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          'hidden lg:flex fixed top-[72px] z-50 w-6 h-6 bg-card border border-border rounded-full items-center justify-center hover:bg-accent transition-all duration-300',
          isCollapsed ? 'left-[68px]' : 'left-[248px]'
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

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
          'lg:hidden fixed left-0 top-16 bottom-0 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 z-40',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ 
          backgroundColor: theme === 'dark' ? '#0b0b14' : '#fafafa',
          borderColor: theme === 'dark' ? '#1a1a2e' : '#e5e7eb'
        }}
      >
        {/* User Info */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">{companyInitial}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground truncate">
                {companyName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.name?.split(' ')[0] || 'Usuário'}
              </p>
            </div>
          </div>
        </div>

        {/* Company Switcher - Mobile */}
        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-700">
          <CompanySwitcher isCollapsed={false} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-4">
            Módulos
          </p>
          {renderNavItems(menuItems, false)}

          {isSystemAdmin && adminMenuItems.length > 0 && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-4 mt-6">
                Administração
              </p>
              {renderNavItems(adminMenuItems, false)}
            </>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-sidebar-border">
          {optionsDropdown(false)}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'transition-all duration-300',
          'pt-16 lg:pt-0',
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        {children}
      </main>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deseja mesmo sair?</DialogTitle>
            <DialogDescription>
              Caso saia agora da página, talvez possa ocorrer a perda de dados e alterações que fez recentemente. Deseja continuar mesmo assim?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmLogout}>
              Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
