import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as XLSX from 'xlsx';

/**
 * Tipos de dados do contexto financeiro
 */
export interface CashFlowEntry {
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'receita' | 'despesa';
  month?: string;
  year?: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpense: number;
  profit: number;
}

export interface MonthlyData {
  month: string;
  receita: number;
  despesa: number;
}

interface FinancialContextData {
  cashFlow: CashFlowEntry[];
  summary: FinancialSummary;
  monthlyData: MonthlyData[];
  processExcel: (file: File) => Promise<void>;
  clearData: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Contexto para gerenciar dados financeiros
 */
const FinancialContext = createContext<FinancialContextData | undefined>(undefined);

/**
 * Provider do contexto financeiro
 */
export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cashFlow, setCashFlow] = useState<CashFlowEntry[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    totalExpense: 0,
    profit: 0,
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calcula o resumo financeiro a partir dos dados de fluxo de caixa
   */
  const calculateSummary = (data: CashFlowEntry[]): FinancialSummary => {
    const totalRevenue = data
      .filter((entry) => entry.type === 'receita')
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalExpense = data
      .filter((entry) => entry.type === 'despesa')
      .reduce((sum, entry) => sum + Math.abs(entry.amount), 0);

    const profit = totalRevenue - totalExpense;

    return { totalRevenue, totalExpense, profit };
  };

  /**
   * Agrupa dados por mês para o gráfico
   */
  const calculateMonthlyData = (data: CashFlowEntry[]): MonthlyData[] => {
    const monthlyMap = new Map<string, { receita: number; despesa: number }>();

    data.forEach((entry) => {
      const monthKey = entry.month || 'Sem data';
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { receita: 0, despesa: 0 });
      }

      const monthData = monthlyMap.get(monthKey)!;
      
      if (entry.type === 'receita') {
        monthData.receita += entry.amount;
      } else {
        monthData.despesa += Math.abs(entry.amount);
      }
    });

    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        receita: data.receita,
        despesa: data.despesa,
      }))
      .sort((a, b) => {
        // Ordenar por mês/ano
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const [monthA] = a.month.split('/');
        const [monthB] = b.month.split('/');
        return months.indexOf(monthA) - months.indexOf(monthB);
      });
  };

  /**
   * Processa o arquivo Excel e extrai os dados financeiros
   */
  const processExcel = async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Ler o arquivo
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Pegar a primeira planilha
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Converter para JSON
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

      // Processar e validar os dados
      const processedData: CashFlowEntry[] = jsonData.map((row, index) => {
        // Tentar identificar as colunas (flexível para diferentes formatos)
        const date = row['Data'] || row['data'] || row['DATE'] || row['date'] || '';
        const description = row['Descrição'] || row['descricao'] || row['DESCRIPTION'] || row['description'] || row['Descricao'] || `Item ${index + 1}`;
        const category = row['Categoria'] || row['categoria'] || row['CATEGORY'] || row['category'] || 'Sem categoria';
        const amount = parseFloat(row['Valor'] || row['valor'] || row['AMOUNT'] || row['amount'] || row['Value'] || row['value'] || 0);
        const type = row['Tipo'] || row['tipo'] || row['TYPE'] || row['type'] || '';

        // Determinar tipo (receita/despesa) baseado no valor ou no campo tipo
        let entryType: 'receita' | 'despesa';
        if (type.toLowerCase().includes('receit') || type.toLowerCase().includes('revenue')) {
          entryType = 'receita';
        } else if (type.toLowerCase().includes('despes') || type.toLowerCase().includes('expense')) {
          entryType = 'despesa';
        } else {
          // Se não tiver tipo, usar o sinal do valor
          entryType = amount >= 0 ? 'receita' : 'despesa';
        }

        // Extrair mês/ano da data
        let month = 'Sem data';
        let year = new Date().getFullYear();
        
        if (date) {
          const dateObj = new Date(date);
          if (!isNaN(dateObj.getTime())) {
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            month = `${monthNames[dateObj.getMonth()]}/${dateObj.getFullYear()}`;
            year = dateObj.getFullYear();
          }
        }

        return {
          date: date.toString(),
          description,
          category,
          amount: Math.abs(amount),
          type: entryType,
          month,
          year,
        };
      });

      // Validar se há dados
      if (processedData.length === 0) {
        throw new Error('Nenhum dado encontrado no arquivo');
      }

      // Atualizar estados
      setCashFlow(processedData);
      setSummary(calculateSummary(processedData));
      setMonthlyData(calculateMonthlyData(processedData));

      console.log('✅ Excel processado com sucesso:', {
        totalEntries: processedData.length,
        summary: calculateSummary(processedData),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar arquivo Excel';
      setError(errorMessage);
      console.error('❌ Erro ao processar Excel:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Limpa todos os dados
   */
  const clearData = () => {
    setCashFlow([]);
    setSummary({ totalRevenue: 0, totalExpense: 0, profit: 0 });
    setMonthlyData([]);
    setError(null);
  };

  return (
    <FinancialContext.Provider
      value={{
        cashFlow,
        summary,
        monthlyData,
        processExcel,
        clearData,
        isLoading,
        error,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

/**
 * Hook para usar o contexto financeiro
 */
export const useFinancialContext = (): FinancialContextData => {
  const context = useContext(FinancialContext);
  
  if (!context) {
    throw new Error('useFinancialContext deve ser usado dentro de um FinancialProvider');
  }
  
  return context;
};
