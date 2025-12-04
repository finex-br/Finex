import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../../domain/ports/user-repository.interface';
import { User } from '../../../../domain/entities/user';
import { UserSchema } from '../entities/user.schema';
import { UserMapper } from '../mappers/user.mapper';

/**
 * User Repository Implementation (TypeORM)
 */
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserSchema)
    private readonly repository: Repository<UserSchema>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const schema = await this.repository.findOne({ where: { id } });
    if (!schema) return null;
    return await UserMapper.toDomain(schema);
  }

  async findByEmail(email: string): Promise<User | null> {
    const schema = await this.repository.findOne({ where: { email } });
    if (!schema) return null;
    return await UserMapper.toDomain(schema);
  }

  async exists(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }

  async save(user: User): Promise<void> {
    const schema = await UserMapper.toPersistence(user);
    await this.repository.save(schema);
  }

  async update(user: User): Promise<void> {
    const schema = await UserMapper.toPersistence(user);
    await this.repository.save(schema);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
