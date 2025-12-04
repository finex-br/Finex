import { IDomainEvent } from '../../../../shared/domain/events/domain-events';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';
import { User } from '../entities/user';

export class UserCreatedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;
  public user: User;

  constructor(user: User) {
    this.dateTimeOccurred = new Date();
    this.user = user;
  }

  getAggregateId(): UniqueEntityID {
    return this.user.id;
  }
}
