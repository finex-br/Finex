import { Result } from '../../../../shared/core/result';

/**
 * ColumnMapping - Value Object
 * 
 * Representa o mapeamento entre colunas do Excel e campos esperados.
 * Exemplo: { date: 'Data', description: 'Descrição', amount: 'Valor' }
 */
export interface ColumnMappingProps {
  date?: string;
  description?: string;
  category?: string;
  amount?: string;
  type?: string;
  /**
   * Linhas do Excel (row number) que devem ser ignoradas (ex.: TOTAL, linhas lixo).
   */
  excludedRows?: number[];
  /**
   * Correções por linha (row number do Excel, ex: "22")
   * Exemplo:
   * { "22": { date: "2025-01-10", amount: "123,45" } }
   */
  overrides?: Record<
    string,
    {
      date?: any;
      amount?: any;
      description?: any;
      category?: any;
      type?: any;
    }
  >;

  /**
   * Trilho de auditoria de alterações (ADMIN)
   */
  audit?: Array<{
    at: string; // ISO
    userId: string;
    action: 'OVERRIDE' | 'EXCLUDE';
    details?: any;
  }>;
}

export class ColumnMapping {
  private constructor(private readonly props: ColumnMappingProps) {}

  get date(): string | undefined {
    return this.props.date;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get category(): string | undefined {
    return this.props.category;
  }

  get amount(): string | undefined {
    return this.props.amount;
  }

  get type(): string | undefined {
    return this.props.type;
  }

  get overrides(): ColumnMappingProps['overrides'] {
    return this.props.overrides;
  }

  get excludedRows(): ColumnMappingProps['excludedRows'] {
    return this.props.excludedRows;
  }

  public static create(props: ColumnMappingProps): Result<ColumnMapping> {
    // Validar que pelo menos os campos obrigatórios estão mapeados
    if (!props.date || !props.amount) {
      return Result.fail<ColumnMapping>(
        'Mapeamento incompleto: campos "date" e "amount" são obrigatórios',
      );
    }

    return Result.ok<ColumnMapping>(new ColumnMapping(props));
  }

  /**
   * Cria mapeamento automático baseado em nomes comuns
   */
  public static createAutoMapping(headers: string[]): Result<ColumnMapping> {
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());

    const findColumn = (possibleNames: string[]): string | undefined => {
      for (const name of possibleNames) {
        const index = lowerHeaders.findIndex(h => h.includes(name));
        if (index !== -1) {
          return headers[index]; // Retorna o nome original
        }
      }
      return undefined;
    };

    const props: ColumnMappingProps = {
      date: findColumn(['data', 'date', 'dt']),
      description: findColumn(['descrição', 'descricao', 'description', 'desc']),
      category: findColumn(['categoria', 'category', 'cat']),
      amount: findColumn(['valor', 'amount', 'value', 'price', 'preço']),
      type: findColumn(['tipo', 'type']),
    };

    return ColumnMapping.create(props);
  }

  public toJSON(): ColumnMappingProps {
    return { ...this.props };
  }

  public equals(other: ColumnMapping): boolean {
    return (
      this.props.date === other.props.date &&
      this.props.description === other.props.description &&
      this.props.category === other.props.category &&
      this.props.amount === other.props.amount &&
      this.props.type === other.props.type
    );
  }
}
