/**
 * IExcelAnalyzer - Port (Interface)
 * 
 * Define o contrato para análise de arquivos Excel sem processamento completo.
 * Extrai apenas a estrutura (headers, sample rows) para permitir mapeamento manual.
 */
export interface IExcelAnalyzer {
  /**
   * Analisa estrutura do Excel sem processar dados
   * 
   * @param fileBuffer - Buffer do arquivo Excel
   * @returns Estrutura do documento: headers e sample rows
   */
  analyzeStructure(fileBuffer: Buffer): Promise<{
    headers: string[];
    rows: any[][];
    totalRows: number;
  }>;
}
