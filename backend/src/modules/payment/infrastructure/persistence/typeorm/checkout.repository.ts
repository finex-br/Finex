import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICheckoutRepository } from '../../../domain/ports/checkout-repository.interface';
import { Checkout } from '../../../domain/entities/checkout';
import { CheckoutSchema } from '../typeorm/schemas/checkout.schema';
import { CheckoutMapper } from '../mappers/checkout.mapper';

@Injectable()
export class CheckoutRepository implements ICheckoutRepository {
  constructor(
    @InjectRepository(CheckoutSchema)
    private readonly repository: Repository<CheckoutSchema>,
  ) {}

  async save(checkout: Checkout): Promise<void> {
    const schema = CheckoutMapper.toPersistence(checkout);
    await this.repository.save(schema);
  }

  async findById(id: string): Promise<Checkout | null> {
    const schema = await this.repository.findOne({ where: { id } });
    
    if (!schema) {
      return null;
    }

    return CheckoutMapper.toDomain(schema);
  }

  async findByAsaasCheckoutId(asaasCheckoutId: string): Promise<Checkout | null> {
    const schema = await this.repository.findOne({ where: { asaasCheckoutId } });
    
    if (!schema) {
      return null;
    }

    return CheckoutMapper.toDomain(schema);
  }

  async findByUserId(userId: string): Promise<Checkout[]> {
    const schemas = await this.repository.find({ 
      where: { userId },
      order: { createdAt: 'DESC' }
    });

    return schemas.map(schema => CheckoutMapper.toDomain(schema));
  }

  async update(checkout: Checkout): Promise<void> {
    const schema = CheckoutMapper.toPersistence(checkout);
    await this.repository.save(schema);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
