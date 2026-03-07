import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3, ShieldCheck, TrendingUp, ArrowRight, Zap, Globe, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  heroContainer,
  heroItem,
  staggerContainer,
  staggerItem,
  fadeUp,
  scaleIn,
  viewportOnce,
} from '@/lib/motion';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { BrowserMockup } from '@/components/shared/BrowserMockup';

export function LandingView() {
  const navigate = useNavigate();

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">F</span>
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">FinEx</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleNavigateToLogin}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              Login
            </Button>
            <Button
              variant="gradient"
              onClick={handleNavigateToRegister}
              className="cursor-pointer"
            >
              Criar Conta
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated gradient blobs */}
        <motion.div
          className="absolute top-[-20%] left-[5%] w-[500px] h-[500px] rounded-full bg-primary/[0.05] blur-[100px] pointer-events-none"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full blur-[80px] pointer-events-none"
          style={{ background: 'hsl(168 76% 42% / 0.05)' }}
          animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[30%] right-[30%] w-[300px] h-[300px] rounded-full blur-[90px] pointer-events-none"
          style={{ background: 'hsl(210 68% 52% / 0.04)' }}
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-32 md:pb-36 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            variants={heroContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h1
              variants={heroItem}
              className="text-display text-4xl sm:text-5xl md:text-6xl text-foreground mb-6"
            >
              Transforme dados financeiros em{' '}
              <span className="text-gradient">decisões estratégicas</span>
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
            >
              Plataforma unificada de inteligência financeira, governança corporativa e valuation
              para empresas que levam gestão a sério.
            </motion.p>

            <motion.div
              variants={heroItem}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Button
                variant="gradient"
                size="lg"
                onClick={handleNavigateToRegister}
                className="cursor-pointer h-12 px-8 text-base font-semibold"
              >
                Começar Gratuitamente
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleNavigateToLogin}
                className="cursor-pointer h-12 px-8 text-base"
              >
                Já tenho conta
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Impact Numbers */}
      <motion.section
        className="border-y border-border/50 bg-muted/30"
        variants={fadeUp}
        initial="initial"
        whileInView="whileInView"
        viewport={viewportOnce}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 99.9, suffix: '%', label: 'Uptime garantido', format: (n: number) => n.toFixed(1) + '%' },
              { value: 3, prefix: '< ', suffix: 's', label: 'Tempo de processamento', format: (n: number) => '< ' + Math.round(n) + 's' },
              { value: 256, suffix: '-bit', label: 'Criptografia AES', format: (n: number) => Math.round(n) + '-bit' },
              { value: 24, suffix: '/7', label: 'Suporte técnico', format: (n: number) => Math.round(n) + '/7' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-bold text-foreground font-mono tabular-nums">
                  <AnimatedCounter
                    value={stat.value}
                    format={stat.format}
                    className="text-2xl md:text-3xl font-bold text-foreground font-mono tabular-nums"
                  />
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features — 3 Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <motion.div
          className="text-center mb-16"
          variants={fadeUp}
          initial="initial"
          whileInView="whileInView"
          viewport={viewportOnce}
        >
          <h2 className="text-headline text-3xl md:text-4xl text-foreground mb-4">
            Três pilares da excelência financeira
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Tecnologia que une análise, gestão de risco e inteligência de mercado
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
        >
          {[
            {
              icon: BarChart3,
              title: 'Clareza Total',
              subtitle: 'Visibilidade financeira em tempo real',
              description: 'Consolidação de fluxo de caixa e DRE em tempo real. Entenda suas operações com dashboards intuitivos e insights acionáveis.',
            },
            {
              icon: ShieldCheck,
              title: 'Maturidade & Risco',
              subtitle: 'Governança que protege e cresce',
              description: 'Avalie a governança corporativa e reduza riscos operacionais. Frameworks validados para elevar a maturidade do seu negócio.',
            },
            {
              icon: TrendingUp,
              title: 'Valuation Empresarial',
              subtitle: 'Descubra o valor real do negócio',
              description: 'Descubra quanto sua empresa realmente vale. Metodologias de valuation para fundraising, M&A e planejamento estratégico.',
            },
          ].map((feature) => (
            <motion.div
              key={feature.title}
              variants={staggerItem}
              className="surface-elevated p-6 md:p-8 group cursor-default hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-primary/80 font-medium mb-3">
                {feature.subtitle}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Product Preview — Browser Mockup */}
      <section className="relative bg-gradient-radial">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="text-center mb-12"
            variants={fadeUp}
            initial="initial"
            whileInView="whileInView"
            viewport={viewportOnce}
          >
            <h2 className="text-headline text-3xl md:text-4xl text-foreground mb-4">
              Veja o FinEx em ação
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Interface intuitiva projetada para tomada de decisão rápida
            </p>
          </motion.div>

          <motion.div
            className="max-w-4xl mx-auto"
            variants={scaleIn}
            initial="initial"
            whileInView="whileInView"
            viewport={viewportOnce}
          >
            <BrowserMockup />
          </motion.div>
        </div>
      </section>

      {/* Why FinEx */}
      <section className="bg-muted/30 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="text-center mb-12"
            variants={fadeUp}
            initial="initial"
            whileInView="whileInView"
            viewport={viewportOnce}
          >
            <h2 className="text-headline text-3xl text-foreground mb-4">
              Por que empresas escolhem o FinEx
            </h2>
          </motion.div>
          <motion.div
            className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={viewportOnce}
          >
            {[
              { icon: Zap, title: 'Rápido de configurar', desc: 'Importe seus dados em minutos. Sem integrações complexas.' },
              { icon: Lock, title: 'Segurança bancária', desc: 'Dados criptografados em repouso e em trânsito. LGPD compliant.' },
              { icon: Globe, title: 'Acesso em qualquer lugar', desc: 'Aplicação web responsiva. Funciona em desktop, tablet e mobile.' },
            ].map((item) => (
              <motion.div key={item.title} variants={staggerItem} className="text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="max-w-3xl mx-auto surface-elevated bg-mesh p-10 md:p-14 text-center"
          variants={fadeUp}
          initial="initial"
          whileInView="whileInView"
          viewport={viewportOnce}
        >
          <h2 className="text-headline text-2xl md:text-3xl text-foreground mb-4">
            Pronto para transformar sua gestão financeira?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Junte-se a empresas que já tomam decisões baseadas em dados reais.
          </p>
          <Button
            variant="gradient"
            size="lg"
            onClick={handleNavigateToRegister}
            className="cursor-pointer h-12 px-8 text-base font-semibold"
          >
            Começar Agora
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">F</span>
              </div>
              <span className="text-base font-semibold text-foreground">FinEx</span>
              <span className="text-sm text-muted-foreground ml-2">
                por <span className="text-foreground font-medium">Singular</span>
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FinEx. Todos os direitos reservados.
            </p>

            <div className="flex items-center gap-6">
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Privacidade
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Termos
              </Link>
              <a
                href="https://wa.me/5561961740440"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
