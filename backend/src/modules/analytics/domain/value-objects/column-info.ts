export enum ColumnDataType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
}

export interface ColumnInfo {
  name: string;
  type: ColumnDataType;
  sampleValues: string[];
}
