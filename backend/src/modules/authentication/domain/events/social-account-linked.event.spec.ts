import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SocialAccountLinkedEvent } from './social-account-linked.event';
import { UniqueEntityID } from '../../../../shared/core/unique-entity-id';

describe('SocialAccountLinkedEvent', () => {
  it('should create a valid event', () => {
    const userId = new UniqueEntityID('user-123');
    const provider = 'GITHUB';
    const providerId = 'github123';
    const email = 'user@gmail.com';

    const event = new SocialAccountLinkedEvent(userId, provider, providerId, email);

    expect(event.userId).toBe(userId);
    expect(event.provider).toBe(provider);
    expect(event.providerId).toBe(providerId);
    expect(event.email).toBe(email);
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('should create event with current timestamp', () => {
    const userId = new UniqueEntityID('user-123');
    const before = new Date();
    
    const event = new SocialAccountLinkedEvent(userId, 'GITHUB', 'github123', 'user@github.com');
    
    const after = new Date();
    
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should have different timestamps for different events', async () => {
    const userId = new UniqueEntityID('user-123');
    
    const event1 = new SocialAccountLinkedEvent(userId, 'FACEBOOK', 'facebook123', 'user@facebook.com');
    
    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const event2 = new SocialAccountLinkedEvent(userId, 'GITHUB', 'github123', 'user@github.com');
    
    expect(event2.occurredAt.getTime()).toBeGreaterThan(event1.occurredAt.getTime());
  });
});
