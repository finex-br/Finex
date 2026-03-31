import { QueryDefinition } from '../value-objects/data-source-config';

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  totalRows: number;
}

export interface IAnalyticsEngine {
  executeQuery(query: QueryDefinition, companyId: string): Promise<QueryResult>;
}
