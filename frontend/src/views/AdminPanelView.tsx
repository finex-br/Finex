import { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { CreateSurveyForm } from '../components/admin/CreateSurveyForm';
import { SurveysList } from '../components/admin/SurveysList';
import { CompletedAssessmentsList } from '../components/admin/CompletedAssessmentsList';
import { PlusCircle, FileText, CheckSquare } from 'lucide-react';

/**
 * AdminPanelView
 * 
 * Central de administração de questionários.
 * Apenas usuários com role ADMIN podem acessar.
 * 
 * Abas:
 * - Criar Questionário: Formulário para criar novo questionário com perguntas
 * - Questionários Criados: Lista de todos os questionários criados
 * - Questionários Respondidos: Lista de respostas com filtros por empresa e questionário
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
              Gerenciamento de Questionários
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Crie, visualize e gerencie questionários e suas respostas
            </p>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto">
              <TabsTrigger value="create-survey" className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Criar</span>
                <span className="sm:hidden">Criar</span>
              </TabsTrigger>
              <TabsTrigger value="list-surveys" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Questionários</span>
                <span className="sm:hidden">Lista</span>
              </TabsTrigger>
              <TabsTrigger value="responses" className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Respostas</span>
                <span className="sm:hidden">Resp</span>
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
                  <SurveysList />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Settings */}
            <TabsContent value="responses" className="space-y-0">
              <Card>
                <CardHeader>
                  <CardTitle>Questionários Respondidos</CardTitle>
                  <CardDescription>
                    Visualize e filtre as respostas dos questionários por empresa e questionário
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CompletedAssessmentsList />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
