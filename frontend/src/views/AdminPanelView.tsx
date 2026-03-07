import { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { PageHeader } from '../components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CreateSurveyForm } from '../components/admin/CreateSurveyForm';
import { SurveysList } from '../components/admin/SurveysList';
import { CompletedAssessmentsList } from '../components/admin/CompletedAssessmentsList';
import { PlusCircle, FileText, CheckSquare } from 'lucide-react';

export function AdminPanelView() {
  const [activeTab, setActiveTab] = useState('create-survey');

  return (
    <AppLayout>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
          <PageHeader
            breadcrumb="Administração"
            title="Gerenciamento de Questionários"
            subtitle="Crie, visualize e gerencie questionários e suas respostas"
          />

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto bg-muted/50">
              <TabsTrigger value="create-survey" className="flex items-center gap-2 cursor-pointer">
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Criar</span>
                <span className="sm:hidden">Criar</span>
              </TabsTrigger>
              <TabsTrigger value="list-surveys" className="flex items-center gap-2 cursor-pointer">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Questionários</span>
                <span className="sm:hidden">Lista</span>
              </TabsTrigger>
              <TabsTrigger value="responses" className="flex items-center gap-2 cursor-pointer">
                <CheckSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Respostas</span>
                <span className="sm:hidden">Resp</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab: Create Survey */}
            <TabsContent value="create-survey" className="space-y-0">
              <div className="surface-elevated p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-foreground mb-1">Criar Novo Questionário</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Crie um questionário com título, descrição e adicione perguntas de diferentes tipos
                </p>
                <CreateSurveyForm />
              </div>
            </TabsContent>

            {/* Tab: List Surveys */}
            <TabsContent value="list-surveys" className="space-y-0">
              <div className="surface-elevated p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-foreground mb-1">Questionários Criados</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Lista de todos os questionários disponíveis no sistema
                </p>
                <SurveysList />
              </div>
            </TabsContent>

            {/* Tab: Responses */}
            <TabsContent value="responses" className="space-y-0">
              <div className="surface-elevated p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-foreground mb-1">Questionários Respondidos</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Visualize e filtre as respostas dos questionários por empresa e questionário
                </p>
                <CompletedAssessmentsList />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
