import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  FileSearch,
  LogOut,
  Menu,
  X,
  FileText,
  Shield,
  Database,
  BarChart3,
  Sun,
  Moon,
  User,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { CompanySwitcher } from '@/components/CompanySwitcher';
import { BottomNav } from '@/components/BottomNav';
import { useAuthStore } from '@/store/authStore';
import { companyService } from '@/services/companyService';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

/**
 * AppLayout — Apple Design Language
 *
 * Desktop: Minimal side rail (64px) with icon-only nav + tooltip labels
 * Mobile: Full-width header + slide-in sheet + bottom tab bar
 */
export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, clearAuth } = useAuthStore();
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
    }).catch(() => { });
  }, []);

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

  const allNavItems = [...menuItems, ...adminMenuItems];

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

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';
  const firstName = user?.name?.split(' ')[0] || 'Usuário';

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* ======================================================
            MOBILE HEADER — Clean top bar
            ====================================================== */}
        <header className="lg:hidden fixed top-0 left-0 right-0 h-14 surface-translucent border-b border-border z-50 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <span className="text-base font-semibold text-foreground truncate max-w-[180px]">
              {companyName}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* ======================================================
            DESKTOP SIDE RAIL — 64px icon-only navigation
            ====================================================== */}
        <aside
          className="hidden lg:flex fixed left-0 top-0 h-screen w-16 bg-sidebar flex-col items-center border-r border-sidebar-border z-40"
          role="navigation"
          aria-label="Menu principal"
        >
          {/* Logo */}
          <div className="h-16 flex items-center justify-center w-full">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm tracking-tight">F</span>
            </div>
          </div>

          {/* Main Nav */}
          <ScrollArea className="flex-1 w-full">
            <nav className="flex flex-col items-center gap-1 px-2 py-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Tooltip key={item.id} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handleNavigation(item.path)}
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer',
                          'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent',
                          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                          active && 'bg-sidebar-accent text-sidebar-primary'
                        )}
                        aria-label={item.label}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className="w-[18px] h-[18px]" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12} className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              {isSystemAdmin && adminMenuItems.length > 0 && (
                <>
                  <Separator className="my-2 w-6" />
                  {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Tooltip key={item.id} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleNavigation(item.path)}
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer',
                              'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent',
                              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                              active && 'bg-sidebar-accent text-sidebar-primary'
                            )}
                            aria-label={item.label}
                            aria-current={active ? 'page' : undefined}
                          >
                            <Icon className="w-[18px] h-[18px]" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={12} className="font-medium">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </>
              )}
            </nav>
          </ScrollArea>

          {/* Bottom: Theme + User */}
          <div className="flex flex-col items-center gap-1 py-3 px-2 border-t border-sidebar-border w-full">
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={handleToggleTheme}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all duration-150 cursor-pointer"
                  aria-label="Alternar tema"
                >
                  {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={12} className="font-medium">
                {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer hover:bg-sidebar-accent transition-all duration-150"
                  aria-label="Menu do usuário"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">{userInitial}</span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56">
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-foreground">{user?.name || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{user?.email || ''}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* ======================================================
            MOBILE SIDEBAR OVERLAY
            ====================================================== */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* ======================================================
            MOBILE SIDEBAR SHEET
            ====================================================== */}
        <aside
          className={cn(
            'lg:hidden fixed left-0 top-14 bottom-0 w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-250 ease-out z-40',
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          role="navigation"
          aria-label="Menu principal"
        >
          {/* Company Switcher */}
          <div className="px-3 py-3 border-b border-sidebar-border">
            <CompanySwitcher isCollapsed={false} />
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1">
            <nav className="p-3 space-y-0.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-3">
                Módulos
              </p>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={cn(
                      'w-full sidebar-item text-sm cursor-pointer',
                      'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                      active && 'sidebar-item-active'
                    )}
                  >
                    <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                    <span className="font-medium truncate">{item.label}</span>
                  </button>
                );
              })}

              {isSystemAdmin && adminMenuItems.length > 0 && (
                <>
                  <Separator className="my-3" />
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3 px-3">
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
                          'w-full sidebar-item text-sm cursor-pointer',
                          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                          active && 'sidebar-item-active'
                        )}
                      >
                        <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                        <span className="font-medium truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </>
              )}
            </nav>
          </ScrollArea>

          {/* User Section */}
          <div className="p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary-foreground">{userInitial}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{firstName}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                aria-label="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* ======================================================
            DESKTOP TOP BAR — breadcrumb + company + user
            ====================================================== */}
        <header className="hidden lg:flex fixed top-0 left-16 right-0 h-14 surface-translucent border-b border-border z-30 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <CompanySwitcher isCollapsed={false} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-1">
              {firstName}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
                  <span className="text-xs font-bold text-primary-foreground">{userInitial}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-foreground">{user?.name || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{user?.email || ''}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleToggleTheme} className="cursor-pointer">
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 mr-2" />
                  ) : (
                    <Moon className="w-4 h-4 mr-2" />
                  )}
                  {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ======================================================
            MAIN CONTENT
            ====================================================== */}
        <main
          className={cn(
            'transition-all duration-200',
            'pt-14 lg:pt-14',
            'pb-16 lg:pb-0',
            'lg:ml-16'
          )}
        >
          {children}
        </main>

        {/* Bottom Navigation — Mobile */}
        <BottomNav items={allNavItems} />

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
              <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)} className="cursor-pointer">
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmLogout} className="cursor-pointer">
                Sair
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
