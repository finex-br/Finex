-- Migration: Add Staging Columns to financial_uploads
-- Sistema de upload flexível com mapeamento e validação

-- Adicionar colunas para suportar fluxo de staging
ALTER TABLE financial_uploads 
  ADD COLUMN IF NOT EXISTS raw_data jsonb,
  ADD COLUMN IF NOT EXISTS column_mapping jsonb,
  ADD COLUMN IF NOT EXISTS validation_result jsonb;

-- Atualizar constraint do status para incluir novos valores
ALTER TABLE financial_uploads DROP CONSTRAINT IF EXISTS financial_uploads_status_check;
ALTER TABLE financial_uploads 
  ADD CONSTRAINT financial_uploads_status_check 
  CHECK (status IN ('UPLOADED', 'MAPPED', 'VALIDATED', 'PROCESSING', 'DONE', 'ERROR', 'REJECTED'));

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_financial_uploads_status ON financial_uploads(status);
CREATE INDEX IF NOT EXISTS idx_financial_uploads_company_status ON financial_uploads(company_id, status);

-- Comentários para documentação
COMMENT ON COLUMN financial_uploads.raw_data IS 'Estrutura bruta do Excel: { headers: string[], rows: any[][], totalRows: number }';
COMMENT ON COLUMN financial_uploads.column_mapping IS 'Mapeamento definido pelo admin (rascunho): { date: "coluna", amount: "coluna", ... }';
COMMENT ON COLUMN financial_uploads.validation_result IS 'Resultado da validação (rascunho): { isValid: boolean, errors: [], warnings: [], ... }';

-- Status flow: UPLOADED → MAPPED → VALIDATED → PROCESSING → DONE
--                 ↓          ↓          ↓
--              REJECTED  REJECTED  REJECTED
