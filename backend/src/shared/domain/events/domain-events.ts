import { UniqueEntityID } from '../../core/unique-entity-id';

/**
 * Domain Event interface
 */
export interface IDomainEvent {
  dateTimeOccurred: Date;
  getAggregateId(): UniqueEntityID;
}

/**
 * Domain Event Handler interface
 */
export interface IHandle<T extends IDomainEvent> {
  setupSubscriptions(): void;
  handle(event: T): void;
}
