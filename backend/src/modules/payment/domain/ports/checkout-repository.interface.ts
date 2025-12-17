import { Checkout } from '../entities/checkout';

/**
 * Checkout Repository Port (Interface)
 * Defines the contract for checkout persistence
 */
export interface ICheckoutRepository {
  findById(id: string): Promise<Checkout | null>;
  findByUserId(userId: string): Promise<Checkout[]>;
  findByAsaasCheckoutId(asaasCheckoutId: string): Promise<Checkout | null>;
  save(checkout: Checkout): Promise<void>;
  update(checkout: Checkout): Promise<void>;
  delete(id: string): Promise<void>;
}
