export interface SelectColumn {
  column: string;
  aggregate?: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
  alias?: string;
}

export interface WhereClause {
  column: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';
  value: any;
}

export interface OrderByClause {
  column: string;
  direction: 'ASC' | 'DESC';
}

export interface JoinClause {
  datasetId: string;
  leftColumn: string;
  rightColumn: string;
  type: 'INNER' | 'LEFT';
}

export interface QueryDefinition {
  datasetId: string;
  select: SelectColumn[];
  where?: WhereClause[];
  groupBy?: string[];
  orderBy?: OrderByClause[];
  limit?: number;
  joins?: JoinClause[];
}

export type DataSourceMode = 'STATIC' | 'DYNAMIC';

export interface DataSourceConfig {
  mode: DataSourceMode;
  datasetIds: string[];
  query: QueryDefinition;
  staticData?: Record<string, any>[];
}
