# CNPJs Válidos para Teste

## ℹ️ Sobre a Validação

O sistema valida CNPJs usando o algoritmo oficial brasileiro com dígitos verificadores. CNPJs inventados aleatoriamente não funcionam.

## ✅ CNPJs Válidos para Teste

Use um destes CNPJs válidos em suas requisições:

### Formato com Máscara
```
11.222.333/0001-81
34.028.316/0001-03
```

### Formato Sem Máscara (apenas números)
```
11222333000181
34028316000103
```

**Ambos os formatos são aceitos pelo sistema!**

## 📝 Exemplo de Requisição

### Sign Up
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "companyName": "Empresa Teste Ltda",
  "companyCnpj": "11.222.333/0001-81"
}
```

ou

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "companyName": "Empresa Teste Ltda",
  "companyCnpj": "11222333000181"
}
```

## 🧪 Gerando CNPJs Válidos

Se precisar de mais CNPJs válidos para teste, você pode:

1. **Usar geradores online:**
   - https://www.4devs.com.br/gerador_de_cnpj
   - https://www.geradorcnpj.com/

2. **Usar a biblioteca de testes:**
   ```bash
   cd backend
   npm test -- cnpj.spec.ts
   ```

## ⚠️ CNPJs Inválidos Comuns

Estes **NÃO** funcionam:

```
❌ 12345678000190  (dígitos verificadores incorretos)
❌ 00000000000000  (todos os dígitos iguais)
❌ 11111111111111  (todos os dígitos iguais)
❌ 12345678901234  (dígitos verificadores incorretos)
```

## 🔍 Como Funciona a Validação

O sistema valida:

1. **Formato:** Deve ter exatamente 14 dígitos numéricos
2. **Dígitos repetidos:** Não pode ter todos os dígitos iguais
3. **Dígitos verificadores:** Os 2 últimos dígitos são calculados usando um algoritmo específico

### Algoritmo de Validação

```
CNPJ: 11.222.333/0001-81
      ^^^^^^^^^^^^^^^^^^
      Base (12 dígitos) + Check (2 dígitos)

1º dígito verificador: calculado usando pesos [5,4,3,2,9,8,7,6,5,4,3,2]
2º dígito verificador: calculado usando pesos [6,5,4,3,2,9,8,7,6,5,4,3,2]
```

## 🚀 Testando via cURL

```bash
# Com máscara
curl -X POST http://localhost:3000/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@test.com",
    "password": "senha123",
    "companyName": "Empresa Teste",
    "companyCnpj": "11.222.333/0001-81"
  }'

# Sem máscara
curl -X POST http://localhost:3000/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@test.com",
    "password": "senha123",
    "companyName": "Outra Empresa",
    "companyCnpj": "34028316000103"
  }'
```

## 📱 Testando via Postman/Insomnia

1. Crie uma nova requisição POST
2. URL: `http://localhost:3000/auth/sign-up`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):

```json
{
  "name": "Seu Nome",
  "email": "seu.email@example.com",
  "password": "sua_senha",
  "companyName": "Nome da Empresa",
  "companyCnpj": "11222333000181"
}
```

## 💡 Dica

Se você está desenvolvendo e testando localmente, sempre use um destes CNPJs válidos. O sistema não aceita CNPJs inventados para garantir integridade dos dados.
