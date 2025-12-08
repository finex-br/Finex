import { UniqueEntityID } from './unique-entity-id';

/**
 * Domain Event interface
 * Represents something that happened in the domain that domain experts care about
 */
export interface DomainEvent {
  occurredAt: Date;
  getAggregateId(): UniqueEntityID;
}
