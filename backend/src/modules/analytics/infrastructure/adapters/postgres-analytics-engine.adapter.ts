import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  IAnalyticsEngine,
  QueryResult,
} from '../../domain/ports/analytics-engine.interface';
import { QueryDefinition } from '../../domain/value-objects/data-source-config';

@Injectable()
export class PostgresAnalyticsEngineAdapter implements IAnalyticsEngine {
  constructor(private readonly dataSource: DataSource) {}

  async executeQuery(
    query: QueryDefinition,
    companyId: string,
  ): Promise<QueryResult> {
    if (!query || !query.select || query.select.length === 0) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    if (!query.datasetId) {
      return { columns: [], rows: [], totalRows: 0 };
    }

    const { sql, params } = this.buildSql(query, companyId);

    console.log('[AnalyticsEngine] Executing query:', sql);
    console.log('[AnalyticsEngine] Params:', params);

    const rawRows = await this.dataSource.query(sql, params);

    const columns =
      rawRows.length > 0 ? Object.keys(rawRows[0]) : [];

    return {
      columns,
      rows: rawRows,
      totalRows: rawRows.length,
    };
  }

  private buildSql(
    query: QueryDefinition,
    companyId: string,
  ): { sql: string; params: any[] } {
    const params: any[] = [];
    let paramIndex = 1;

    // SELECT
    const selectClauses = query.select.map((col) => {
      const jsonbAccess = `row_data->>'${this.sanitizeColumnName(col.column)}'`;
      const alias = col.alias || col.column;

      if (col.aggregate) {
        const numericCast = `(${jsonbAccess})::numeric`;
        if (col.aggregate === 'COUNT') {
          return `COUNT(${jsonbAccess}) AS "${alias}"`;
        }
        return `${col.aggregate}(${numericCast}) AS "${alias}"`;
      }

      return `${jsonbAccess} AS "${alias}"`;
    });

    // FROM
    let fromClause = `dataset_rows`;

    // WHERE
    const whereClauses: string[] = [];

    // Always filter by dataset_id
    params.push(query.datasetId);
    whereClauses.push(`dataset_id = $${paramIndex++}`);

    // Always filter by company_id
    params.push(companyId);
    whereClauses.push(`company_id = $${paramIndex++}`);

    // User-defined WHERE
    if (query.where && query.where.length > 0) {
      for (const condition of query.where) {
        const colAccess = `row_data->>'${this.sanitizeColumnName(condition.column)}'`;

        if (condition.operator === 'IN') {
          const values = Array.isArray(condition.value)
            ? condition.value
            : [condition.value];
          const placeholders = values.map((v: any) => {
            params.push(v);
            return `$${paramIndex++}`;
          });
          whereClauses.push(`${colAccess} IN (${placeholders.join(', ')})`);
        } else if (['>', '<', '>=', '<='].includes(condition.operator)) {
          params.push(condition.value);
          whereClauses.push(
            `(${colAccess})::numeric ${condition.operator} $${paramIndex++}`,
          );
        } else if (condition.operator === 'LIKE') {
          params.push(condition.value);
          whereClauses.push(`${colAccess} LIKE $${paramIndex++}`);
        } else {
          params.push(condition.value);
          whereClauses.push(`${colAccess} ${condition.operator} $${paramIndex++}`);
        }
      }
    }

    // GROUP BY
    let groupByClause = '';
    if (query.groupBy && query.groupBy.length > 0) {
      const groupByCols = query.groupBy.map(
        (col) => `row_data->>'${this.sanitizeColumnName(col)}'`,
      );
      groupByClause = `GROUP BY ${groupByCols.join(', ')}`;
    }

    // ORDER BY
    let orderByClause = '';
    if (query.orderBy && query.orderBy.length > 0) {
      const orderByCols = query.orderBy.map((ob) => {
        const alias = `"${ob.column}"`;
        return `${alias} ${ob.direction}`;
      });
      orderByClause = `ORDER BY ${orderByCols.join(', ')}`;
    }

    // LIMIT
    let limitClause = '';
    if (query.limit) {
      params.push(query.limit);
      limitClause = `LIMIT $${paramIndex++}`;
    }

    const sql = [
      `SELECT ${selectClauses.join(', ')}`,
      `FROM ${fromClause}`,
      `WHERE ${whereClauses.join(' AND ')}`,
      groupByClause,
      orderByClause,
      limitClause,
    ]
      .filter(Boolean)
      .join(' ');

    return { sql, params };
  }

  private sanitizeColumnName(name: string): string {
    // Prevent SQL injection via column names
    return name.replace(/[^a-zA-Z0-9_\-\s\.áàãâéêíóôõúüçÁÀÃÂÉÊÍÓÔÕÚÜÇ]/g, '');
  }
}
