-- Schema DuckDB para Financial Transactions
-- Este é um exemplo. Adapte para seu projeto!

-- Criar tabela de transações financeiras
CREATE TABLE IF NOT EXISTS financial_transactions (
    -- Primary Key
    id VARCHAR PRIMARY KEY,
    
    -- Multi-tenancy
    company_id VARCHAR NOT NULL,
    
    -- Dados da transação
    date TIMESTAMP NOT NULL,
    description VARCHAR(500) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    type VARCHAR(10) NOT NULL, -- RECEITA ou DESPESA
    category VARCHAR(100) NOT NULL,
    
    -- Datas opcionais
    competence_date TIMESTAMP,
    payment_date TIMESTAMP,
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes para performance
    INDEX idx_company_date (company_id, date),
    INDEX idx_company_type (company_id, type),
    INDEX idx_company_competence (company_id, competence_date)
);

-- Queries de exemplo para agregações (OLAP)

-- 1. Summary por empresa
SELECT 
    company_id,
    SUM(CASE WHEN type = 'RECEITA' THEN amount ELSE 0 END) as total_revenue,
    SUM(CASE WHEN type = 'DESPESA' THEN amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN type = 'RECEITA' THEN amount ELSE -amount END) as profit
FROM financial_transactions
WHERE company_id = 'company-123'
GROUP BY company_id;

-- 2. Dados mensais (para gráficos)
SELECT 
    strftime(COALESCE(competence_date, date), '%b/%Y') as month,
    SUM(CASE WHEN type = 'RECEITA' THEN amount ELSE 0 END) as revenue,
    SUM(CASE WHEN type = 'DESPESA' THEN amount ELSE 0 END) as expense
FROM financial_transactions
WHERE company_id = 'company-123'
GROUP BY strftime(COALESCE(competence_date, date), '%Y-%m')
ORDER BY strftime(COALESCE(competence_date, date), '%Y-%m');

-- 3. Top categorias (mais gastos)
SELECT 
    category,
    SUM(amount) as total,
    COUNT(*) as transaction_count
FROM financial_transactions
WHERE company_id = 'company-123' AND type = 'DESPESA'
GROUP BY category
ORDER BY total DESC
LIMIT 10;

-- 4. Transações por período
SELECT * 
FROM financial_transactions
WHERE company_id = 'company-123'
  AND date BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY date DESC;
