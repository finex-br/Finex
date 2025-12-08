import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ISocialAccountRepository } from '../../../application/ports/social-account.repository.interface';
import { SocialAccount } from '../../../domain/entities/social-account';
import { SocialProvider } from '../../../domain/value-objects/social-provider';
import { UniqueEntityID } from '../../../../../shared/core/unique-entity-id';
import { SocialAccountSchema } from './schemas/social-account.schema';
import { SocialAccountMapper } from './mappers/social-account.mapper';

@Injectable()
export class SocialAccountRepository implements ISocialAccountRepository {
  constructor(
    @InjectRepository(SocialAccountSchema)
    private readonly repository: Repository<SocialAccountSchema>,
  ) {}

  async findByUserIdAndProvider(
    userId: UniqueEntityID,
    provider: SocialProvider,
  ): Promise<SocialAccount | null> {
    const schema = await this.repository.findOne({
      where: {
        userId: userId.toString(),
        provider: provider.value,
      },
    });

    if (!schema) {
      return null;
    }

    const result = SocialAccountMapper.toDomain(schema);
    return result.isSuccess ? result.getValue() : null;
  }

  async findByProviderAndProviderId(
    provider: SocialProvider,
    providerId: string,
  ): Promise<SocialAccount | null> {
    const schema = await this.repository.findOne({
      where: {
        provider: provider.value,
        providerId: providerId,
      },
    });

    if (!schema) {
      return null;
    }

    const result = SocialAccountMapper.toDomain(schema);
    return result.isSuccess ? result.getValue() : null;
  }

  async save(socialAccount: SocialAccount): Promise<void> {
    const schema = SocialAccountMapper.toPersistence(socialAccount);
    await this.repository.save(schema);
  }

  async delete(socialAccount: SocialAccount): Promise<void> {
    await this.repository.delete(socialAccount.id.toString());
  }
}
