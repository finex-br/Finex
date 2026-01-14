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
  options JSONB, -- Para armazenar opções de dropdown
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
  status VARCHAR(50) NOT NULL, -- PROCESSING, DONE, ERROR
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

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

-- Índices para Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

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

COMMENT ON DATABASE finex_db IS 'FinEx - Financial Intelligence Platform';
