# Payment Module

## Domínio

Integração com gateway Asaas para pagamentos e checkouts.

### Entidade
- **Checkout** — aggregate root. Props: userId, amount, description, status, asaasCheckoutId, asaasPaymentId, checkoutUrl, maxInstallments (1-12), paidAt, expiresAt

### Máquina de Estados
```
PENDING → CONFIRMED → RECEIVED (estado final)
PENDING → CANCELLED (estado final)
```
- `confirm(asaasPaymentId)` — só de PENDING
- `markAsReceived()` — só de CONFIRMED
- `cancel()` — só se canBeCancelled()

### Value Objects
- `Amount` — valor monetário do pagamento
- `CheckoutStatus` — PENDING | CONFIRMED | RECEIVED | CANCELLED

## DI Tokens
```
'ICheckoutRepository'  → CheckoutRepository (useExisting)
'IPaymentProvider'     → AsaasPaymentProvider (useExisting)
```

## Gateway Asaas
`AsaasPaymentProvider` — criado via factory com `ASAAS_API_KEY` e `ASAAS_ENVIRONMENT` (sandbox/production).

## Controllers
- `PaymentController` — criar checkout (requer auth)
- `AsaasWebhookController` — recebe webhooks do Asaas para atualizar status

## Config
Requer `ASAAS_API_KEY` (obrigatório) e `ASAAS_ENVIRONMENT` (default: sandbox).
