import { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CreateSurveyForm } from '../components/admin/CreateSurveyForm';
import { PlusCircle } from 'lucide-react';

/**
 * AdminPanelView
 * 
 * Painel de administração para gerenciar questionários.
 * Apenas usuários com role ADMIN podem acessar.
 * 
 * Abas:
 * - Criar Questionário: Formulário para criar novo questionário com perguntas
 * - Listar Questionários: (TODO) Lista de todos os questionários criados
 * - Configurações: (TODO) Configurações gerais do sistema
 */
export function AdminPanelView() {
  const [activeTab, setActiveTab] = useState('create-survey');

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Painel de Administração
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Gerencie questionários e configurações do sistema
            </p>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto">
              <TabsTrigger value="create-survey" className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Criar Questionário</span>
                <span className="sm:hidden">Criar</span>
              </TabsTrigger>
              <TabsTrigger value="list-surveys">
                <span className="hidden sm:inline">Listar Questionários</span>
                <span className="sm:hidden">Listar</span>
              </TabsTrigger>
              <TabsTrigger value="settings">
                <span className="hidden sm:inline">Configurações</span>
                <span className="sm:hidden">Config</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab: Create Survey */}
            <TabsContent value="create-survey" className="space-y-0">
              <Card>
                <CardHeader>
                  <CardTitle>Criar Novo Questionário</CardTitle>
                  <CardDescription>
                    Crie um questionário com título, descrição e adicione perguntas de diferentes tipos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateSurveyForm />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: List Surveys */}
            <TabsContent value="list-surveys" className="space-y-0">
              <Card>
                <CardHeader>
                  <CardTitle>Questionários Criados</CardTitle>
                  <CardDescription>
                    Lista de todos os questionários disponíveis no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-slate-500">
                    Funcionalidade em desenvolvimento...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Settings */}
            <TabsContent value="settings" className="space-y-0">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Sistema</CardTitle>
                  <CardDescription>
                    Configure parâmetros gerais e integrações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-slate-500">
                    Funcionalidade em desenvolvimento...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
