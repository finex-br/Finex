import { User } from '../../../../domain/entities/user';
import { UserSchema } from '../entities/user.schema';
import { Email } from '../../../../domain/value-objects/email';
import { Password } from '../../../../domain/value-objects/password';
import { UserRole } from '../../../../domain/value-objects/user-role';
import { PhoneNumber } from '../../../../domain/value-objects/phone-number';
import { UniqueEntityID } from '../../../../../../shared/core/unique-entity-id';

/**
 * User Mapper
 * Converts between Domain Entity and Database Schema
 */
export class UserMapper {
  static async toDomain(raw: UserSchema): Promise<User | null> {
    const emailOrError = Email.create(raw.email);
    const passwordOrError = await Password.create(raw.passwordHash, true);
    const roleOrError = UserRole.create(raw.role);

    // PhoneNumber é opcional
    let phoneNumber: PhoneNumber | undefined;
    if (raw.phoneNumber) {
      const phoneNumberOrError = PhoneNumber.create(raw.phoneNumber);
      if (phoneNumberOrError.isFailure) {
        return null;
      }
      phoneNumber = phoneNumberOrError.getValue();
    }

    if (emailOrError.isFailure || passwordOrError.isFailure || roleOrError.isFailure) {
      return null;
    }

    const userOrError = User.create(
      {
        email: emailOrError.getValue(),
        password: passwordOrError.getValue(),
        name: raw.fullName || '',
        phoneNumber,
        role: roleOrError.getValue(),
        isActive: raw.isActive ?? true,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    );

    return userOrError.isSuccess ? userOrError.getValue() : null;
  }

  static async toPersistence(user: User): Promise<UserSchema> {
    const schema = new UserSchema();
    schema.id = user.id.toString();
    schema.email = user.email.value;
    schema.passwordHash = await user.password.getHashedValue();
    schema.fullName = user.name;
    schema.phoneNumber = user.phoneNumber?.value;
    schema.role = user.role.value;
    schema.isActive = user.isActive;
    schema.createdAt = user.createdAt;
    schema.updatedAt = user.updatedAt;
    return schema;
  }
}
