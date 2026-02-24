import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, ShieldCheck, TrendingUp, ArrowRight } from 'lucide-react';

/**
 * LandingView - Landing Page Institucional do FinEx
 *
 * Objetivo: Comunicar valor, autoridade e converter visitantes em usuários.
 * Foco: Clareza financeira, governança e valuation.
 */
export function LandingView() {
  const navigate = useNavigate();

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Navbar */}
      <nav className="border-b bg-white/80 dark:bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-600">FinEx</span>
          </div>

          {/* CTA Button */}
          <Button
            variant="outline"
            onClick={handleNavigateToLogin}
            className="border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
          >
            Login
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-foreground leading-tight">
            Transforme Dados Financeiros em{' '}
            <span className="text-orange-600">Decisões Estratégicas</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            A plataforma unificada de inteligência financeira, governança e valuation
            que desvenda a verdadeira saúde do seu negócio.
          </p>

          {/* CTA Principal */}
          <div className="pt-4">
            <Button
              size="lg"
              onClick={handleNavigateToLogin}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Acessar Plataforma
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Badge/Proof */}
          <div className="pt-8">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Desenvolvido por <span className="text-orange-600">Singular</span> • Tecnologia de ponta para finanças corporativas
            </p>
          </div>
        </div>
      </section>

      {/* Value Proposition - 3 Pilares */}
      <section className="container mx-auto px-4 py-20 bg-white dark:bg-background">
        <div className="max-w-6xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-foreground mb-4">
              Três Pilares da Excelência Financeira
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Tecnologia que une análise, gestão de risco e inteligência de mercado
            </p>
          </div>

          {/* Grid de Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Card 1: Clareza Total */}
            <Card className="border-2 hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-200 hover:shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-foreground">
                  Clareza Total
                </CardTitle>
                <CardDescription className="text-base">
                  Visibilidade financeira em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-700 dark:text-slate-300">
                  Consolidação de fluxo de caixa e DRE em tempo real.
                  Entenda suas operações com dashboards intuitivos e insights acionáveis.
                </p>
              </CardContent>
            </Card>

            {/* Card 2: Maturidade & Risco */}
            <Card className="border-2 hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-200 hover:shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-foreground">
                  Maturidade & Risco
                </CardTitle>
                <CardDescription className="text-base">
                  Governança que protege e cresce
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-700 dark:text-slate-300">
                  Avalie a governança corporativa e reduza riscos operacionais.
                  Frameworks validados para elevar a maturidade do seu negócio.
                </p>
              </CardContent>
            </Card>

            {/* Card 3: Valuation Empresarial */}
            <Card className="border-2 hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-200 hover:shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-foreground">
                  Valuation Empresarial
                </CardTitle>
                <CardDescription className="text-base">
                  Descubra o valor real do negócio
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-700 dark:text-slate-300">
                  Descubra quanto sua empresa realmente vale. Metodologias de valuation
                  para fundraising, M&A e planejamento estratégico.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-12 text-center shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para transformar sua gestão financeira?
          </h2>
          <p className="text-lg text-orange-100 mb-8">
            Junte-se a empresas que já tomam decisões baseadas em dados reais.
          </p>
          <Button
            size="lg"
            onClick={handleNavigateToLogin}
            className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-6 text-lg font-semibold shadow-lg"
          >
            Começar Agora
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 dark:bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Logo Footer */}
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-orange-600" />
              <span className="text-xl font-bold text-orange-600">FinEx</span>
            </div>

            {/* Copyright */}
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2025 FinEx. Todos os direitos reservados.
            </p>

            {/* Links */}
            <div className="flex items-center space-x-6">
              <Link
                to="/privacy"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-orange-600 transition-colors"
              >
                Privacidade
              </Link>
              <Link
                to="/terms"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-orange-600 transition-colors"
              >
                Termos
              </Link>
              <a
                href="https://wa.me/5561961740440"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-orange-600 transition-colors"
              >
                Contato
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
