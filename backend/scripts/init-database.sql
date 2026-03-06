-- ================================================
-- FINEX - Database Schema v1
-- ================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- MÓDULO CORE
-- ================================================

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  password_hash VARCHAR(255),
  phone_number VARCHAR(20),
  role VARCHAR(50) DEFAULT 'ENTREPRENEUR', -- ADMIN, ENTREPRENEUR, INVESTOR
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Contas Sociais (OAuth)
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- GOOGLE, GITHUB, FACEBOOK
  provider_id VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  display_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

-- Tabela de Empresas
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18),
  sector VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Membros da Empresa
CREATE TABLE IF NOT EXISTS company_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- OWNER, VIEWER
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Tabela de Assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL, -- ACTIVE, BLOCKED
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- MÓDULO INTELIGÊNCIA (SURVEYS)
-- ================================================

-- Tabela de Surveys (Produtos)
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  estimated_time_minutes INT DEFAULT 2,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Versões do Survey
CREATE TABLE IF NOT EXISTS survey_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  effective_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(survey_id, version_number)
);

-- Tabela de Perguntas
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_version_id UUID NOT NULL REFERENCES survey_versions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- DROPDOWN, TEXT, CNPJ, NUMBER, FILE_UPLOAD
  options_json JSONB, -- Para armazenar opções de dropdown
  order_index INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Avaliações (Assessments)
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  survey_version_id UUID NOT NULL REFERENCES survey_versions(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL, -- PENDING, IN_PROGRESS, COMPLETED
  final_score DECIMAL(5,2),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Respostas
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  value_json JSONB NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(assessment_id, question_id)
);

-- ================================================
-- MÓDULO FINANCEIRO & UPLOADS
-- ================================================

-- Tabela de Uploads Financeiros
CREATE TABLE IF NOT EXISTS financial_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  storage_path VARCHAR(500),
  status VARCHAR(50) NOT NULL, -- UPLOADED, MAPPED, VALIDATED, PROCESSING, DONE, ERROR, REJECTED
  raw_data JSONB,
  column_mapping JSONB,
  validation_result JSONB,
  CONSTRAINT financial_uploads_status_check 
    CHECK (status IN ('UPLOADED', 'MAPPED', 'VALIDATED', 'PROCESSING', 'DONE', 'ERROR', 'REJECTED')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- MIGRATION MERGED: Staging Columns (idempotente)
-- ================================================

-- Caso a tabela já exista (ambientes antigos), garante colunas e constraint
ALTER TABLE financial_uploads 
  ADD COLUMN IF NOT EXISTS raw_data jsonb,
  ADD COLUMN IF NOT EXISTS column_mapping jsonb,
  ADD COLUMN IF NOT EXISTS validation_result jsonb;

ALTER TABLE financial_uploads DROP CONSTRAINT IF EXISTS financial_uploads_status_check;
ALTER TABLE financial_uploads 
  ADD CONSTRAINT financial_uploads_status_check 
  CHECK (status IN ('UPLOADED', 'MAPPED', 'VALIDATED', 'PROCESSING', 'DONE', 'ERROR', 'REJECTED'));

-- Tabela de Dados Financeiros
CREATE TABLE IF NOT EXISTS financial_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  upload_id UUID REFERENCES financial_uploads(id) ON DELETE SET NULL,
  description VARCHAR(255),
  amount DECIMAL(15,2) NOT NULL,
  date_competence DATE,
  date_payment DATE,
  type VARCHAR(50) NOT NULL, -- INCOME, EXPENSE
  category VARCHAR(100),
  operational_metadata JSONB DEFAULT NULL, -- Dados operacionais (vending machines, etc)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Categorias Financeiras
CREATE TABLE IF NOT EXISTS financial_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- INCOME, EXPENSE
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- MÓDULO PAGAMENTO
-- ================================================

-- Tabela de Checkouts (Stripe)
CREATE TABLE IF NOT EXISTS checkouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL, -- PENDING, COMPLETED, CANCELLED, EXPIRED
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  product_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- MÓDULO AUDITORIA
-- ================================================

-- Tabela de Logs de Auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_name VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- MÓDULO VALOR INVISÍVEL & ESTRATÉGIA
-- ================================================

-- Tabela de Apontamentos de Consultoria
CREATE TABLE IF NOT EXISTS consulting_appointment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100) NOT NULL, -- SPIN_OFF, MATRIX_QUADRANT, GENERAL_INSIGHT
  data_json JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'DETECTED', -- DETECTED, IN_PROGRESS, VALIDATED, DISCARDED
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- MÓDULO ANALYTICS (DATASETS & DASHBOARDS)
-- ================================================

-- Tabela de Datasets (metadados dos uploads)
CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  uploaded_by UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  columns JSONB NOT NULL DEFAULT '[]',
  row_count INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Dataset Rows (dados brutos em JSONB)
CREATE TABLE IF NOT EXISTS dataset_rows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  row_index INTEGER NOT NULL,
  row_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Dashboards
CREATE TABLE IF NOT EXISTS dashboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  embed_html TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Chart Configs
CREATE TABLE IF NOT EXISTS chart_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  chart_type VARCHAR(50) NOT NULL,
  data_source JSONB NOT NULL,
  visual_config JSONB NOT NULL,
  position JSONB DEFAULT '{"x":0,"y":0,"width":6,"height":4}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- MIGRATION: operational_metadata (idempotente)
-- ================================================
ALTER TABLE financial_data ADD COLUMN IF NOT EXISTS operational_metadata JSONB DEFAULT NULL;

-- ================================================
-- MIGRATION: embed_html em dashboards (idempotente)
-- ================================================
ALTER TABLE dashboards ADD COLUMN IF NOT EXISTS embed_html TEXT;

-- ================================================
-- ÍNDICES PARA PERFORMANCE
-- ================================================

-- Índices para Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Índices para Companies
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj);
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_cnpj_unique ON companies(cnpj) WHERE cnpj IS NOT NULL;

-- Índices para Company Members
CREATE INDEX IF NOT EXISTS idx_company_members_user_id ON company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_company_members_company_id ON company_members(company_id);

-- Índices para Assessments
CREATE INDEX IF NOT EXISTS idx_assessments_company_id ON assessments(company_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);

-- Índices para Answers
CREATE INDEX IF NOT EXISTS idx_answers_assessment_id ON answers(assessment_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);

-- Índices para Financial Data
CREATE INDEX IF NOT EXISTS idx_financial_data_company_id ON financial_data(company_id);
CREATE INDEX IF NOT EXISTS idx_financial_data_date_competence ON financial_data(date_competence);
CREATE INDEX IF NOT EXISTS idx_financial_data_type ON financial_data(type);
CREATE INDEX IF NOT EXISTS idx_financial_data_operational_metadata ON financial_data USING GIN (operational_metadata);

-- Índices para Financial Uploads
CREATE INDEX IF NOT EXISTS idx_financial_uploads_status ON financial_uploads(status);
CREATE INDEX IF NOT EXISTS idx_financial_uploads_company_status ON financial_uploads(company_id, status);

-- Índices para Social Accounts
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_provider ON social_accounts(provider);

-- Índices para Checkouts
CREATE INDEX IF NOT EXISTS idx_checkouts_user_id ON checkouts(user_id);
CREATE INDEX IF NOT EXISTS idx_checkouts_company_id ON checkouts(company_id);
CREATE INDEX IF NOT EXISTS idx_checkouts_status ON checkouts(status);
CREATE INDEX IF NOT EXISTS idx_checkouts_stripe_session_id ON checkouts(stripe_session_id);

-- Índices para Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Índices para Analytics
CREATE INDEX IF NOT EXISTS idx_datasets_company_id ON datasets(company_id);
CREATE INDEX IF NOT EXISTS idx_datasets_status ON datasets(status);
CREATE INDEX IF NOT EXISTS idx_dataset_rows_dataset_id ON dataset_rows(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_rows_company_id ON dataset_rows(company_id);
CREATE INDEX IF NOT EXISTS idx_dataset_rows_data ON dataset_rows USING GIN (row_data);
CREATE INDEX IF NOT EXISTS idx_dashboards_company_id ON dashboards(company_id);
CREATE INDEX IF NOT EXISTS idx_chart_configs_dashboard_id ON chart_configs(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_chart_configs_company_id ON chart_configs(company_id);

-- ================================================
-- DADOS INICIAIS (SEED)
-- ================================================

-- Usuário Admin de Teste
INSERT INTO users (email, full_name, password_hash, role)
VALUES (
  'admin@finex.com',
  'Admin FinEx',
  '$2b$10$YourHashedPasswordHere', -- Você precisará gerar um hash real
  'ADMIN'
)
ON CONFLICT (email) DO NOTHING;

-- Empresa de Teste
INSERT INTO companies (name, cnpj, sector)
VALUES (
  'Empresa Demo LTDA',
  '12.345.678/0001-90',
  'Tecnologia'
)
ON CONFLICT DO NOTHING;

-- Vínculo do admin com a empresa demo (necessário para endpoints que usam company_members)
DO $$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM users WHERE email = 'admin@finex.com' LIMIT 1;
  SELECT id INTO v_company_id FROM companies WHERE cnpj = '12.345.678/0001-90' LIMIT 1;

  IF v_user_id IS NOT NULL AND v_company_id IS NOT NULL THEN
    INSERT INTO company_members (user_id, company_id, role, is_active)
    VALUES (v_user_id, v_company_id, 'OWNER', true)
    ON CONFLICT (user_id, company_id) DO NOTHING;
  END IF;
END
$$;

DO $$
BEGIN
  EXECUTE format(
    'COMMENT ON DATABASE %I IS %L',
    current_database(),
    'FinEx - Financial Intelligence Platform'
  );
END
$$;

COMMENT ON COLUMN financial_uploads.raw_data IS 'Estrutura bruta do Excel: { headers: string[], rows: any[][], totalRows: number }';
COMMENT ON COLUMN financial_uploads.column_mapping IS 'Mapeamento definido pelo admin (rascunho): { date: "coluna", amount: "coluna", ... }';
COMMENT ON COLUMN financial_uploads.validation_result IS 'Resultado da validação (rascunho): { isValid: boolean, errors: [], warnings: [], ... }';
