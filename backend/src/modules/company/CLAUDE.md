# Company Module

## Visão Geral

Módulo mínimo — as entidades Company e CompanyMember vivem no `shared/` porque são usadas por vários módulos.

Este módulo contém apenas:
- `CompanyController` — seleção de empresa ativa pelo usuário (multi-tenant)
- `JwtAuthGuard` como provider local

## Multi-tenant
O usuário pode pertencer a várias empresas. A seleção da empresa ativa é feita aqui e propagada via header `x-company-id` nas requests subsequentes.

## Sem Domínio Local
Não tem entities, value objects ou use cases próprios. Toda lógica de Company está em `shared/domain/entities/`.
