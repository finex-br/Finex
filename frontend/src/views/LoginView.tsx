import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLoginViewModel } from '@/hooks/useLoginViewModel';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/motion';

export function LoginView() {
  const {
    email,
    password,
    setEmail,
    setPassword,
    handleSubmit,
    isLoading,
    error,
  } = useLoginViewModel();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel — Brand (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/70">
        {/* Animated blobs */}
        <motion.div
          className="absolute top-[10%] left-[15%] w-[350px] h-[350px] rounded-full blur-[80px] pointer-events-none"
          style={{ background: 'hsl(168 76% 42% / 0.2)' }}
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[15%] right-[10%] w-[280px] h-[280px] rounded-full blur-[70px] pointer-events-none"
          style={{ background: 'hsl(210 68% 52% / 0.15)' }}
          animate={{ x: [0, -25, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating shapes */}
        <motion.div
          className="absolute top-[20%] right-[25%] w-16 h-16 rounded-2xl bg-white/[0.06] backdrop-blur-sm border border-white/[0.08]"
          animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[30%] left-[20%] w-10 h-10 rounded-full bg-white/[0.05] backdrop-blur-sm border border-white/[0.06]"
          animate={{ y: [0, 6, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <div className="relative z-10 max-w-md text-center px-8">
          <motion.div
            className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-8"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-2xl font-bold text-white tracking-tight">F</span>
          </motion.div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
            FinEx
          </h1>
          <p className="text-lg text-white/70 leading-relaxed">
            Inteligência financeira, governança e valuation em uma plataforma unificada.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <motion.div
          className="w-full max-w-sm"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Mobile Logo */}
          <motion.div variants={staggerItem} className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">F</span>
            </div>
            <span className="text-2xl font-bold text-primary">FinEx</span>
          </motion.div>

          {/* Header */}
          <motion.div variants={staggerItem} className="mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Acesse sua conta para continuar
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={staggerItem} className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
                autoComplete="email"
              />
            </motion.div>

            <motion.div variants={staggerItem} className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
                autoComplete="current-password"
              />
            </motion.div>

            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <motion.div variants={staggerItem}>
              <Button
                type="submit"
                variant="gradient"
                disabled={isLoading}
                className="w-full h-11 font-semibold cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </motion.div>
          </form>

          {/* Link */}
          <motion.div variants={staggerItem} className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Não tem uma conta?{' '}
              <Link
                to="/signup"
                className="text-primary hover:text-primary/80 font-medium hover:underline cursor-pointer"
              >
                Cadastre-se
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
