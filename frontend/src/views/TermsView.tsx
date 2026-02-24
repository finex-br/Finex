import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

export function TermsView() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-600">FinEx</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Termos de Uso</h1>

        <div className="prose prose-slate max-w-none space-y-6">
          <p className="text-slate-700">
            Última atualização: Fevereiro de 2025
          </p>

          <h2 className="text-xl font-semibold text-slate-900">1. Aceitação dos Termos</h2>
          <p className="text-slate-700">
            Ao acessar e utilizar a plataforma FinEx, o usuário concorda com os presentes termos de uso.
            Caso não concorde com alguma disposição, recomendamos que não utilize a plataforma.
          </p>

          <h2 className="text-xl font-semibold text-slate-900">2. Descrição do Serviço</h2>
          <p className="text-slate-700">
            O FinEx é uma plataforma de inteligência financeira, governança e valuation destinada a
            empresas do mercado brasileiro. Os serviços incluem importação e análise de dados financeiros,
            avaliação de maturidade corporativa e geração de relatórios.
          </p>

          <h2 className="text-xl font-semibold text-slate-900">3. Responsabilidades do Usuário</h2>
          <p className="text-slate-700">
            O usuário é responsável pela veracidade e precisão dos dados enviados à plataforma.
            As análises e relatórios gerados pelo FinEx são baseados nos dados fornecidos e não
            substituem consultoria financeira profissional.
          </p>

          <h2 className="text-xl font-semibold text-slate-900">4. Propriedade Intelectual</h2>
          <p className="text-slate-700">
            Todo o conteúdo da plataforma, incluindo software, design, textos e logotipos, é de
            propriedade da Singular Tech e está protegido por leis de propriedade intelectual.
          </p>

          <h2 className="text-xl font-semibold text-slate-900">5. Limitação de Responsabilidade</h2>
          <p className="text-slate-700">
            O FinEx não se responsabiliza por decisões tomadas com base nas análises geradas pela
            plataforma. Os resultados apresentados são de caráter informativo e não constituem
            recomendação de investimento.
          </p>

          <h2 className="text-xl font-semibold text-slate-900">6. Contato</h2>
          <p className="text-slate-700">
            Para dúvidas sobre estes termos, entre em contato pelo WhatsApp:{' '}
            <a
              href="https://wa.me/5561961740440"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:underline"
            >
              +55 61 96174-0440
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-50 mt-12">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-sm text-slate-600">
            © 2025 FinEx. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
