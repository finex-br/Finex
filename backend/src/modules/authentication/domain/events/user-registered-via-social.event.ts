import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';
import { DomainEvent } from '../../../../shared/core/domain-event';

export class UserRegisteredViaSocialEvent implements DomainEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly userId: UniqueEntityID,
    public readonly provider: string,
    public readonly providerId: string,
    public readonly email: string,
    public readonly name: string,
  ) {
    this.occurredAt = new Date();
  }

  getAggregateId(): UniqueEntityID {
    return this.userId;
  }
}
