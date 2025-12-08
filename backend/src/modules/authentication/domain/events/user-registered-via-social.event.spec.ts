import { UserRegisteredViaSocialEvent } from './user-registered-via-social.event';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';

describe('UserRegisteredViaSocialEvent', () => {
  it('should create a valid event', () => {
    const userId = new UniqueEntityID('user-123');
    const provider = 'GOOGLE';
    const providerId = 'google123';
    const email = 'user@gmail.com';
    const name = 'John Doe';

    const event = new UserRegisteredViaSocialEvent(userId, provider, providerId, email, name);

    expect(event.userId).toBe(userId);
    expect(event.provider).toBe(provider);
    expect(event.providerId).toBe(providerId);
    expect(event.email).toBe(email);
    expect(event.name).toBe(name);
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('should create event with current timestamp', () => {
    const userId = new UniqueEntityID('user-456');
    const before = new Date();
    
    const event = new UserRegisteredViaSocialEvent(
      userId,
      'FACEBOOK',
      'fb123',
      'user@facebook.com',
      'Jane Doe'
    );
    
    const after = new Date();
    
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should have different timestamps for different events', async () => {
    const userId1 = new UniqueEntityID('user-789');
    const userId2 = new UniqueEntityID('user-012');
    
    const event1 = new UserRegisteredViaSocialEvent(
      userId1,
      'APPLE',
      'apple123',
      'user1@icloud.com',
      'User One'
    );
    
    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const event2 = new UserRegisteredViaSocialEvent(
      userId2,
      'GITHUB',
      'github456',
      'user2@github.com',
      'User Two'
    );
    
    expect(event2.occurredAt.getTime()).toBeGreaterThan(event1.occurredAt.getTime());
  });
});
