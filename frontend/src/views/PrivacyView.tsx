import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

export function PrivacyView() {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary">FinEx</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Política de Privacidade</h1>

        <div className="prose max-w-none space-y-6">
          <p className="text-muted-foreground">
            Última atualização: Fevereiro de 2025
          </p>

          <h2 className="text-xl font-semibold text-foreground">1. Coleta de Dados</h2>
          <p className="text-muted-foreground">
            O FinEx coleta informações pessoais fornecidas voluntariamente pelo usuário durante o cadastro
            e uso da plataforma, incluindo nome, e-mail, dados da empresa e informações financeiras
            enviadas para análise.
          </p>

          <h2 className="text-xl font-semibold text-foreground">2. Uso dos Dados</h2>
          <p className="text-muted-foreground">
            Os dados coletados são utilizados exclusivamente para fornecer os serviços da plataforma,
            incluindo análise financeira, geração de relatórios e avaliação de maturidade corporativa.
            Não compartilhamos dados pessoais com terceiros sem consentimento expresso.
          </p>

          <h2 className="text-xl font-semibold text-foreground">3. Armazenamento e Segurança</h2>
          <p className="text-muted-foreground">
            Todos os dados são armazenados em servidores seguros com criptografia em trânsito e em repouso.
            Adotamos medidas técnicas e organizacionais para proteger as informações contra acesso
            não autorizado, perda ou destruição.
          </p>

          <h2 className="text-xl font-semibold text-foreground">4. Direitos do Usuário</h2>
          <p className="text-muted-foreground">
            O usuário tem direito a acessar, corrigir, exportar ou solicitar a exclusão de seus dados
            pessoais a qualquer momento, conforme previsto pela Lei Geral de Proteção de Dados (LGPD).
          </p>

          <h2 className="text-xl font-semibold text-foreground">5. Contato</h2>
          <p className="text-muted-foreground">
            Para dúvidas sobre esta política, entre em contato pelo WhatsApp:{' '}
            <a
              href="https://wa.me/5561961740440"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              +55 61 96174-0440
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted mt-12">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 FinEx. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
