# 📊 Roadmap de Desenvolvimento - Gráficos com Filtros de Período

> **Objetivo**: Implementar sistema completo de gráficos financeiros com filtros de período (semana, mês, trimestre, semestre, ano, personalizado) usando TDD.

---

## 🎯 Visão Geral

### Estado Atual
✅ **Backend**: 
- Endpoint `GET /financial/data` retorna summary + monthlyData
- 109 testes passando (100% cobertura)
- Clean Architecture + DDD implementado
- Repository interface pronta (IFinancialRepository)

✅ **Frontend**:
- financialService com upload + getData
- DateFilter component existe mas não conectado ao backend
- DashboardView renderiza views mas sem dados reais

❌ **Faltando**:
- Filtros de período no backend (query params)
- Integração frontend → backend com filtros
- Componentes de gráficos (Recharts)
- Hook useFinancialData com estado de filtros
- Testes E2E completos

---

## 📋 Roadmap em 5 Fases (TDD)

---

## 🚀 **FASE 1: Backend - DTOs e Contratos (Filtros de Período)**

### 🎯 Objetivo
Criar DTOs e interfaces para suportar filtros de período no backend.

### 📦 Entregáveis

#### 1.1 - Adicionar DTOs de Filtro
**Arquivo**: `backend/src/modules/financial/application/dtos/financial.dto.ts`

```typescript
// Enum para tipos de período
export enum PeriodType {
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  SEMESTER = 'SEMESTER',
  YEAR = 'YEAR',
  CUSTOM = 'CUSTOM',
}

// DTO de filtro de período
export interface PeriodFilterDTO {
  type: PeriodType;
  startDate?: string; // ISO 8601 (YYYY-MM-DD)
  endDate?: string;   // ISO 8601 (YYYY-MM-DD)
}

// Atualizar GetFinancialDataRequestDTO
export interface GetFinancialDataRequestDTO {
  companyId: string;
  userId: string;
  periodFilter?: PeriodFilterDTO; // NOVO
}

// DTO para gráfico de categorias
export interface CategoryChartDataDTO {
  category: string;
  revenue: number;
  expense: number;
  total: number;
}

// DTO para gráfico de tendência
export interface TrendChartDataDTO {
  date: string; // YYYY-MM-DD
  revenue: number;
  expense: number;
  profit: number;
}

// Resposta expandida com dados para gráficos
export interface GetFinancialDataResponseDTO {
  summary: FinancialSummaryDTO;
  monthlyData: MonthlyDataDTO[];
  categoryData: CategoryChartDataDTO[]; // NOVO
  trendData: TrendChartDataDTO[];       // NOVO
  period: {                              // NOVO - Metadados do período
    type: PeriodType;
    startDate: string;
    endDate: string;
  };
}
```

#### 1.2 - Criar Value Object PeriodFilter
**Arquivo**: `backend/src/modules/financial/domain/value-objects/period-filter.ts`

```typescript
import { Result } from '../../../../shared/core/result';
import { ValueObject } from '../../../../shared/core/value-object';

interface PeriodFilterProps {
  type: 'WEEK' | 'MONTH' | 'QUARTER' | 'SEMESTER' | 'YEAR' | 'CUSTOM';
  startDate?: Date;
  endDate?: Date;
}

export class PeriodFilter extends ValueObject<PeriodFilterProps> {
  get type(): string {
    return this.props.type;
  }

  get startDate(): Date | undefined {
    return this.props.startDate;
  }

  get endDate(): Date | undefined {
    return this.props.endDate;
  }

  private constructor(props: PeriodFilterProps) {
    super(props);
  }

  // Factory method com validações
  public static create(props: PeriodFilterProps): Result<PeriodFilter> {
    // Validação: CUSTOM requer datas
    if (props.type === 'CUSTOM') {
      if (!props.startDate || !props.endDate) {
        return Result.fail('Período customizado requer startDate e endDate');
      }
      if (props.startDate > props.endDate) {
        return Result.fail('startDate não pode ser maior que endDate');
      }
    }

    // Validação: Tipos predefinidos não devem ter datas
    if (props.type !== 'CUSTOM' && (props.startDate || props.endDate)) {
      return Result.fail('Tipos predefinidos não devem ter startDate/endDate');
    }

    return Result.ok(new PeriodFilter(props));
  }

  // Calcula datas reais com base no tipo
  public getDateRange(): { startDate: Date; endDate: Date } {
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (this.props.type === 'CUSTOM') {
      return {
        startDate: this.props.startDate!,
        endDate: this.props.endDate!,
      };
    }

    let startDate: Date;

    switch (this.props.type) {
      case 'WEEK':
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'MONTH':
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'QUARTER':
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'SEMESTER':
        startDate = new Date(endDate);
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'YEAR':
        startDate = new Date(endDate);
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        throw new Error('Tipo de período inválido');
    }

    return { startDate, endDate };
  }
}
```

#### 1.3 - Testes do PeriodFilter
**Arquivo**: `backend/src/modules/financial/domain/value-objects/period-filter.spec.ts`

**Testes esperados**:
- ✅ Criar período WEEK sem datas
- ✅ Criar período MONTH sem datas
- ✅ Criar período QUARTER sem datas
- ✅ Criar período SEMESTER sem datas
- ✅ Criar período YEAR sem datas
- ✅ Criar período CUSTOM com datas válidas
- ❌ Falhar CUSTOM sem startDate
- ❌ Falhar CUSTOM sem endDate
- ❌ Falhar CUSTOM com startDate > endDate
- ❌ Falhar tipos predefinidos com datas
- ✅ Calcular dateRange para WEEK (últimos 7 dias)
- ✅ Calcular dateRange para MONTH (últimos 30 dias)
- ✅ Calcular dateRange para QUARTER (últimos 3 meses)
- ✅ Calcular dateRange para SEMESTER (últimos 6 meses)
- ✅ Calcular dateRange para YEAR (últimos 12 meses)
- ✅ Calcular dateRange para CUSTOM (usar datas fornecidas)

**Total esperado**: ~16 testes

---

## 🔧 **FASE 2: Backend - Repository Interface (Métodos de Filtro)**

### 🎯 Objetivo
Atualizar interface do repositório para suportar filtros de período.

### 📦 Entregáveis

#### 2.1 - Atualizar IFinancialRepository
**Arquivo**: `backend/src/modules/financial/domain/ports/financial-repository.interface.ts`

```typescript
import { FinancialTransaction } from '../entities/financial-transaction';

export interface IFinancialRepository {
  // Já existente
  save(transaction: FinancialTransaction): Promise<void>;
  saveBatch(transactions: FinancialTransaction[]): Promise<void>;

  // Atualizar para incluir filtro de período
  calculateSummary(
    companyId: string,
    userId: string,
    startDate?: Date,  // NOVO
    endDate?: Date,    // NOVO
  ): Promise<{
    totalRevenue: number;
    totalExpense: number;
    profit: number;
  }>;

  getMonthlyData(
    companyId: string,
    userId: string,
    startDate?: Date,  // NOVO
    endDate?: Date,    // NOVO
  ): Promise<
    Array<{
      month: string;
      revenue: number;
      expense: number;
    }>
  >;

  // NOVOS MÉTODOS para gráficos
  getCategoryData(
    companyId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    Array<{
      category: string;
      revenue: number;
      expense: number;
      total: number;
    }>
  >;

  getTrendData(
    companyId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
    granularity: 'day' | 'week' | 'month', // Granularidade dos dados
  ): Promise<
    Array<{
      date: string;
      revenue: number;
      expense: number;
      profit: number;
    }>
  >;
}
```

#### 2.2 - Implementar Skeleton Repository
**Arquivo**: `backend/src/modules/financial/infrastructure/persistence/duckdb-financial.repository.ts`

```typescript
// Atualizar métodos existentes com filtro de data
async calculateSummary(
  companyId: string,
  userId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<{ totalRevenue: number; totalExpense: number; profit: number }> {
  // TODO: Implementar SQL com filtro WHERE data BETWEEN startDate AND endDate
  const query = `
    SELECT 
      SUM(CASE WHEN type = 'RECEITA' THEN amount ELSE 0 END) as totalRevenue,
      SUM(CASE WHEN type = 'DESPESA' THEN amount ELSE 0 END) as totalExpense
    FROM financial_transactions
    WHERE company_id = ? AND user_id = ?
    ${startDate ? 'AND transaction_date >= ?' : ''}
    ${endDate ? 'AND transaction_date <= ?' : ''}
  `;
  
  // Montar params dinamicamente
  const params = [companyId, userId];
  if (startDate) params.push(startDate.toISOString());
  if (endDate) params.push(endDate.toISOString());
  
  // TODO: Executar query e retornar resultado
  throw new Error('Not implemented - DuckDB integration pending');
}

// Implementar novos métodos getCategoryData e getTrendData
async getCategoryData(
  companyId: string,
  userId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<Array<{ category: string; revenue: number; expense: number; total: number }>> {
  // TODO: Implementar SQL
  const query = `
    SELECT 
      category,
      SUM(CASE WHEN type = 'RECEITA' THEN amount ELSE 0 END) as revenue,
      SUM(CASE WHEN type = 'DESPESA' THEN amount ELSE 0 END) as expense,
      SUM(CASE WHEN type = 'RECEITA' THEN amount ELSE -amount END) as total
    FROM financial_transactions
    WHERE company_id = ? AND user_id = ?
    ${startDate ? 'AND transaction_date >= ?' : ''}
    ${endDate ? 'AND transaction_date <= ?' : ''}
    GROUP BY category
    ORDER BY total DESC
  `;
  
  throw new Error('Not implemented - DuckDB integration pending');
}

async getTrendData(
  companyId: string,
  userId: string,
  startDate?: Date,
  endDate?: Date,
  granularity: 'day' | 'week' | 'month' = 'day',
): Promise<Array<{ date: string; revenue: number; expense: number; profit: number }>> {
  // TODO: Implementar SQL com GROUP BY dinâmico
  const dateFormat = {
    day: '%Y-%m-%d',
    week: '%Y-W%W',
    month: '%Y-%m',
  }[granularity];
  
  const query = `
    SELECT 
      strftime('${dateFormat}', transaction_date) as date,
      SUM(CASE WHEN type = 'RECEITA' THEN amount ELSE 0 END) as revenue,
      SUM(CASE WHEN type = 'DESPESA' THEN amount ELSE 0 END) as expense,
      SUM(CASE WHEN type = 'RECEITA' THEN amount ELSE -amount END) as profit
    FROM financial_transactions
    WHERE company_id = ? AND user_id = ?
    ${startDate ? 'AND transaction_date >= ?' : ''}
    ${endDate ? 'AND transaction_date <= ?' : ''}
    GROUP BY date
    ORDER BY date ASC
  `;
  
  throw new Error('Not implemented - DuckDB integration pending');
}
```

#### 2.3 - Mock Repository para Testes
**Arquivo**: `backend/src/modules/financial/infrastructure/persistence/mock-financial.repository.ts`

Criar mock completo implementando todos os métodos com dados fictícios para testes.

---

## 📊 **FASE 3: Backend - Use Cases com Filtros**

### 🎯 Objetivo
Atualizar GetFinancialDataUseCase para aceitar e processar filtros de período.

### 📦 Entregáveis

#### 3.1 - Atualizar GetFinancialDataUseCase
**Arquivo**: `backend/src/modules/financial/application/use-cases/get-financial-data.use-case.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../shared/core/use-case.interface';
import { IFinancialRepository } from '../../domain/ports/financial-repository.interface';
import {
  GetFinancialDataRequestDTO,
  GetFinancialDataResponseDTO,
  PeriodFilterDTO,
} from '../dtos/financial.dto';
import { PeriodFilter } from '../../domain/value-objects/period-filter';

@Injectable()
export class GetFinancialDataUseCase
  implements IUseCase<GetFinancialDataRequestDTO, GetFinancialDataResponseDTO>
{
  constructor(private readonly financialRepository: IFinancialRepository) {}

  async execute(request: GetFinancialDataRequestDTO): Promise<GetFinancialDataResponseDTO> {
    const { companyId, userId, periodFilter } = request;

    // 1. Processar filtro de período
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    let periodType = 'YEAR'; // Default
    let granularity: 'day' | 'week' | 'month' = 'month';

    if (periodFilter) {
      const periodFilterOrError = PeriodFilter.create({
        type: periodFilter.type,
        startDate: periodFilter.startDate ? new Date(periodFilter.startDate) : undefined,
        endDate: periodFilter.endDate ? new Date(periodFilter.endDate) : undefined,
      });

      if (periodFilterOrError.isFailure) {
        throw new Error(periodFilterOrError.error);
      }

      const periodFilterVO = periodFilterOrError.getValue();
      const dateRange = periodFilterVO.getDateRange();
      startDate = dateRange.startDate;
      endDate = dateRange.endDate;
      periodType = periodFilter.type;

      // Definir granularidade com base no período
      if (periodType === 'WEEK') granularity = 'day';
      else if (periodType === 'MONTH') granularity = 'day';
      else if (periodType === 'QUARTER' || periodType === 'SEMESTER') granularity = 'week';
      else granularity = 'month';
    }

    // 2. Buscar dados do repositório (em paralelo)
    const [summary, monthlyData, categoryData, trendData] = await Promise.all([
      this.financialRepository.calculateSummary(companyId, userId, startDate, endDate),
      this.financialRepository.getMonthlyData(companyId, userId, startDate, endDate),
      this.financialRepository.getCategoryData(companyId, userId, startDate, endDate),
      this.financialRepository.getTrendData(companyId, userId, startDate, endDate, granularity),
    ]);

    // 3. Retornar resposta expandida
    return {
      summary,
      monthlyData,
      categoryData,
      trendData,
      period: {
        type: periodType as any,
        startDate: startDate?.toISOString().split('T')[0] || '',
        endDate: endDate?.toISOString().split('T')[0] || '',
      },
    };
  }
}
```

#### 3.2 - Testes do GetFinancialDataUseCase (Atualizado)
**Arquivo**: `backend/src/modules/financial/application/use-cases/get-financial-data.use-case.spec.ts`

**Novos testes**:
- ✅ Executar sem filtro (default: último ano)
- ✅ Executar com filtro WEEK
- ✅ Executar com filtro MONTH
- ✅ Executar com filtro QUARTER
- ✅ Executar com filtro SEMESTER
- ✅ Executar com filtro YEAR
- ✅ Executar com filtro CUSTOM (datas válidas)
- ❌ Falhar com filtro CUSTOM inválido (sem datas)
- ❌ Falhar com filtro CUSTOM (startDate > endDate)
- ✅ Passar startDate/endDate corretos para repository
- ✅ Retornar categoryData corretamente
- ✅ Retornar trendData corretamente
- ✅ Retornar metadados de período
- ✅ Definir granularity correta (day para WEEK, month para YEAR)

**Total esperado**: ~14 testes (além dos 9 existentes)

---

## 🌐 **FASE 4: Backend - Controller com Query Params**

### 🎯 Objetivo
Atualizar FinancialController para aceitar filtros via query params.

### 📦 Entregáveis

#### 4.1 - Atualizar FinancialController
**Arquivo**: `backend/src/modules/financial/presentation/controllers/financial.controller.ts`

```typescript
import { Controller, Post, Get, Query, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { PeriodType } from '../../application/dtos/financial.dto';

@Controller('financial')
export class FinancialController {
  /**
   * GET /financial/data?period=MONTH&startDate=2024-01-01&endDate=2024-12-31
   * 
   * Busca dados financeiros com filtros de período.
   * 
   * Query Params:
   * - period: WEEK | MONTH | QUARTER | SEMESTER | YEAR | CUSTOM
   * - startDate: YYYY-MM-DD (apenas para CUSTOM)
   * - endDate: YYYY-MM-DD (apenas para CUSTOM)
   */
  @Get('data')
  async getFinancialData(
    @Request() req: any,
    @Query('period') period?: PeriodType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const companyId = req.user?.companyId || 'default-company';
      const userId = req.user?.id || 'default-user';

      // Montar filtro de período
      const periodFilter = period
        ? {
            type: period,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          }
        : undefined;

      const result = await this.getFinancialDataUseCase.execute({
        companyId,
        userId,
        periodFilter,
      });

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao buscar dados financeiros',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
```

#### 4.2 - Testes E2E do Controller (Atualizado)
**Arquivo**: `backend/src/modules/financial/presentation/controllers/financial.controller.spec.ts`

**Novos testes**:
- ✅ GET /data sem query params (default)
- ✅ GET /data?period=WEEK
- ✅ GET /data?period=MONTH
- ✅ GET /data?period=QUARTER
- ✅ GET /data?period=SEMESTER
- ✅ GET /data?period=YEAR
- ✅ GET /data?period=CUSTOM&startDate=2024-01-01&endDate=2024-12-31
- ❌ GET /data?period=CUSTOM sem startDate (400 Bad Request)
- ❌ GET /data?period=CUSTOM sem endDate (400 Bad Request)
- ❌ GET /data?period=INVALID (400 Bad Request)
- ✅ Retornar categoryData no response
- ✅ Retornar trendData no response
- ✅ Retornar metadados de período no response

**Total esperado**: ~13 novos testes (além dos 14 existentes)

---

## 💻 **FASE 5: Frontend - Components, Hooks e Integração**

### 🎯 Objetivo
Criar componentes de gráficos e integrar com backend via filtros.

### 📦 Entregáveis

#### 5.1 - Instalar Dependências
```powershell
cd frontend
npm install recharts
npm install -D @types/recharts
```

#### 5.2 - Atualizar FinancialService
**Arquivo**: `frontend/src/services/financialService.ts`

```typescript
export enum PeriodType {
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  SEMESTER = 'SEMESTER',
  YEAR = 'YEAR',
  CUSTOM = 'CUSTOM',
}

export interface PeriodFilter {
  type: PeriodType;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;
}

export interface CategoryChartData {
  category: string;
  revenue: number;
  expense: number;
  total: number;
}

export interface TrendChartData {
  date: string;
  revenue: number;
  expense: number;
  profit: number;
}

export interface FinancialDataResponse {
  summary: FinancialSummary;
  monthlyData: MonthlyData[];
  categoryData: CategoryChartData[];  // NOVO
  trendData: TrendChartData[];        // NOVO
  period: {                            // NOVO
    type: PeriodType;
    startDate: string;
    endDate: string;
  };
}

export const financialService = {
  /**
   * Busca dados financeiros com filtro de período
   */
  getFinancialData: async (
    periodFilter?: PeriodFilter,
  ): Promise<FinancialDataResponse> => {
    const params = new URLSearchParams();
    
    if (periodFilter) {
      params.append('period', periodFilter.type);
      if (periodFilter.startDate) params.append('startDate', periodFilter.startDate);
      if (periodFilter.endDate) params.append('endDate', periodFilter.endDate);
    }

    const response = await api.get<FinancialDataResponse>(
      `/financial/data?${params.toString()}`,
    );

    return response.data;
  },
  
  // Manter método uploadExcel existente...
};
```

#### 5.3 - Criar Hook useFinancialData
**Arquivo**: `frontend/src/hooks/useFinancialData.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import {
  financialService,
  FinancialDataResponse,
  PeriodFilter,
  PeriodType,
} from '@/services/financialService';

export const useFinancialData = () => {
  const [data, setData] = useState<FinancialDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>({
    type: PeriodType.YEAR,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await financialService.getFinancialData(periodFilter);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao buscar dados');
    } finally {
      setLoading(false);
    }
  }, [periodFilter]);

  // Fetch automático quando periodFilter muda
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updatePeriodFilter = (filter: PeriodFilter) => {
    setPeriodFilter(filter);
  };

  return {
    data,
    loading,
    error,
    periodFilter,
    updatePeriodFilter,
    refetch: fetchData,
  };
};
```

#### 5.4 - Testes do useFinancialData
**Arquivo**: `frontend/src/hooks/useFinancialData.spec.ts`

**Testes esperados**:
- ✅ Inicializar com periodFilter = YEAR
- ✅ Chamar API automaticamente no mount
- ✅ Atualizar data após fetch bem-sucedido
- ✅ Atualizar loading durante fetch
- ✅ Atualizar error após falha
- ✅ Refetch ao mudar periodFilter
- ✅ updatePeriodFilter atualiza estado
- ✅ refetch chama API novamente
- ✅ Passar periodFilter correto para API

**Total esperado**: ~9 testes

#### 5.5 - Criar Componente DateFilter (Conectado)
**Arquivo**: `frontend/src/components/DateFilter.tsx` (Atualizar)

```typescript
import { PeriodType, PeriodFilter } from '@/services/financialService';

interface DateFilterProps {
  value: PeriodFilter;
  onChange: (filter: PeriodFilter) => void;
}

export const DateFilter = ({ value, onChange }: DateFilterProps) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customDates, setCustomDates] = useState({ start: '', end: '' });

  const options = [
    { label: '7 dias', value: PeriodType.WEEK },
    { label: '1 mês', value: PeriodType.MONTH },
    { label: '3 meses', value: PeriodType.QUARTER },
    { label: '6 meses', value: PeriodType.SEMESTER },
    { label: '1 ano', value: PeriodType.YEAR },
    { label: 'Personalizado', value: PeriodType.CUSTOM },
  ];

  const handleSelect = (type: PeriodType) => {
    if (type === PeriodType.CUSTOM) {
      setShowCustomModal(true);
    } else {
      onChange({ type });
    }
  };

  const handleCustomSubmit = () => {
    onChange({
      type: PeriodType.CUSTOM,
      startDate: customDates.start,
      endDate: customDates.end,
    });
    setShowCustomModal(false);
  };

  return (
    <>
      <Select value={value.type} onValueChange={handleSelect}>
        {/* Implementar UI com shadcn Select */}
      </Select>
      
      {/* Dialog para período customizado */}
      {showCustomModal && (
        <Dialog open={showCustomModal} onOpenChange={setShowCustomModal}>
          {/* Input de datas */}
        </Dialog>
      )}
    </>
  );
};
```

#### 5.6 - Criar Componente FinancialCharts
**Arquivo**: `frontend/src/components/charts/FinancialCharts.tsx`

```typescript
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FinancialDataResponse } from '@/services/financialService';

interface FinancialChartsProps {
  data: FinancialDataResponse;
}

export const FinancialCharts = ({ data }: FinancialChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Tendência (Linha) */}
      <div className="bg-card p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Tendência Financeira</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              name="Receita"
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              name="Despesa"
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#3b82f6"
              name="Lucro"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Categorias (Barra) */}
      <div className="bg-card p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Por Categoria</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#10b981" name="Receita" />
            <Bar dataKey="expense" fill="#ef4444" name="Despesa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico Mensal (Barra) */}
      <div className="bg-card p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Visão Mensal</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#10b981" name="Receita" />
            <Bar dataKey="expense" fill="#ef4444" name="Despesa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* KPIs (Resumo) */}
      <div className="bg-card p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Resumo do Período</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Receita Total</p>
            <p className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(data.summary.totalRevenue)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Despesa Total</p>
            <p className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(data.summary.totalExpense)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lucro</p>
            <p className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(data.summary.profit)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

#### 5.7 - Atualizar DashboardView
**Arquivo**: `frontend/src/views/DashboardView.tsx`

```typescript
import { useFinancialData } from '@/hooks/useFinancialData';
import { DateFilter } from '@/components/DateFilter';
import { FinancialCharts } from '@/components/charts/FinancialCharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const DashboardView = () => {
  const { data, loading, error, periodFilter, updatePeriodFilter } = useFinancialData();

  if (loading) {
    return <Skeleton className="w-full h-96" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return <p>Nenhum dado disponível</p>;
  }

  return (
    <div className="space-y-6">
      {/* Filtro de Período */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Financeiro</h2>
        <DateFilter value={periodFilter} onChange={updatePeriodFilter} />
      </div>

      {/* Metadados do Período */}
      <div className="text-sm text-muted-foreground">
        Período: {data.period.startDate} até {data.period.endDate}
      </div>

      {/* Gráficos */}
      <FinancialCharts data={data} />
    </div>
  );
};
```

#### 5.8 - Testes do FinancialCharts
**Arquivo**: `frontend/src/components/charts/FinancialCharts.spec.tsx`

**Testes esperados**:
- ✅ Renderizar gráfico de tendência
- ✅ Renderizar gráfico de categorias
- ✅ Renderizar gráfico mensal
- ✅ Renderizar KPIs com valores corretos
- ✅ Formatar valores em BRL

**Total esperado**: ~5 testes

---

## 📊 Resumo de Testes Esperados

| **Fase** | **Arquivo** | **Testes** |
|----------|-------------|------------|
| 1 | `period-filter.spec.ts` | 16 |
| 3 | `get-financial-data.use-case.spec.ts` | 14 (novos) |
| 4 | `financial.controller.spec.ts` | 13 (novos) |
| 5 | `useFinancialData.spec.ts` | 9 |
| 5 | `FinancialCharts.spec.tsx` | 5 |
| **TOTAL** | | **57 novos testes** |
| **TOTAL GERAL** | | **166 testes** (109 existentes + 57 novos) |

---

## 🎯 Ordem de Execução Recomendada

### 1️⃣ **Backend Domain** (Fase 1)
```powershell
# Criar PeriodFilter Value Object + Testes
cd backend
npm test -- period-filter.spec
```

### 2️⃣ **Backend Repository** (Fase 2)
```powershell
# Atualizar interfaces e criar Mock Repository
# Não precisa testes (são interfaces)
```

### 3️⃣ **Backend Application** (Fase 3)
```powershell
# Atualizar Use Case + Testes
npm test -- get-financial-data.use-case.spec
```

### 4️⃣ **Backend Presentation** (Fase 4)
```powershell
# Atualizar Controller + Testes E2E
npm test -- financial.controller.spec
```

### 5️⃣ **Frontend Integration** (Fase 5)
```powershell
cd ../frontend
npm install recharts @types/recharts
npm test -- useFinancialData.spec
npm test -- FinancialCharts.spec
npm run dev # Testar visualmente
```

---

## 🚦 Critérios de Aceitação

### Backend
- ✅ Todos os 43 novos testes passando (16 + 14 + 13)
- ✅ Endpoint GET /financial/data aceita query params
- ✅ Filtros aplicados corretamente no Use Case
- ✅ PeriodFilter valida regras de negócio
- ✅ Repository interface atualizada

### Frontend
- ✅ Todos os 14 novos testes passando (9 + 5)
- ✅ Hook useFinancialData busca dados automaticamente
- ✅ DateFilter conectado ao backend
- ✅ Gráficos renderizam corretamente
- ✅ Loading/Error states tratados
- ✅ Filtros atualizados refazem fetch

### Integração E2E
- ✅ Selecionar período → Gráficos atualizam
- ✅ Período customizado funciona
- ✅ Dados consistentes entre KPIs e gráficos

---

## 📚 Referências Técnicas

### Recharts Docs
- Line Chart: https://recharts.org/en-US/api/LineChart
- Bar Chart: https://recharts.org/en-US/api/BarChart
- Responsive Container: https://recharts.org/en-US/api/ResponsiveContainer

### Clean Architecture
- Use Cases devem orquestrar lógica
- Value Objects validam regras de domínio
- Repository abstrai persistência

### TDD
- Red → Green → Refactor
- Testes primeiro, implementação depois
- Mocks para dependencies

---

## ⚡ Próximos Passos Após Roadmap

1. **Implementar DuckDB Repository** (substituir Mock)
2. **Adicionar Filtros Avançados** (categorias, tipos)
3. **Exportação de Relatórios** (PDF/Excel)
4. **Real-time Updates** (WebSockets)
5. **Cache de Queries** (Redis)

---

**🎉 Roadmap completo! Pronto para começar?**
