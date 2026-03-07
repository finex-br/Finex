import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSignUpViewModel } from '@/hooks/useSignUpViewModel';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/motion';

export function SignUpView() {
  const {
    formData,
    handleChange,
    handleSubmit,
    isLoading,
    error,
  } = useSignUpViewModel();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

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
            Comece hoje a transformar seus dados financeiros em decisões estratégicas.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 overflow-y-auto">
        <motion.div
          className="w-full max-w-sm py-8"
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
              Criar Conta
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Preencha seus dados para começar
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <motion.div variants={staggerItem} className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Nome Completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="João Silva"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
                autoComplete="name"
              />
            </motion.div>

            <motion.div variants={staggerItem} className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
                autoComplete="email"
              />
            </motion.div>

            <motion.div variants={staggerItem} className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-foreground">
                Telefone
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="(11) 98765-4321"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
                autoComplete="tel"
              />
              <p className="text-xs text-muted-foreground">
                Com DDD: (11) 98765-4321 ou 11987654321
              </p>
            </motion.div>

            <motion.div variants={staggerItem} className="space-y-2">
              <Label htmlFor="companyName" className="text-sm font-medium text-foreground">
                Nome da Empresa
              </Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Minha Empresa LTDA"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
                autoComplete="organization"
              />
            </motion.div>

            <motion.div variants={staggerItem} className="space-y-2">
              <Label htmlFor="cnpj" className="text-sm font-medium text-foreground">
                CNPJ
              </Label>
              <Input
                id="cnpj"
                type="text"
                placeholder="12.345.678/0001-90"
                value={formData.cnpj}
                onChange={(e) => handleChange('cnpj', e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Formato: 12.345.678/0001-90
              </p>
            </motion.div>

            <motion.div variants={staggerItem} className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial
              </p>
            </motion.div>

            <motion.div variants={staggerItem} className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirmar Senha
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                disabled={isLoading}
                required
                className="w-full"
                autoComplete="new-password"
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
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>
            </motion.div>
          </form>

          {/* Link */}
          <motion.div variants={staggerItem} className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary/80 font-medium hover:underline cursor-pointer"
              >
                Entrar
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
