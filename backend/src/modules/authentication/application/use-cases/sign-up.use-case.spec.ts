import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SignUpUseCase } from './sign-up.use-case';
import { IUserRepository } from '../../domain/ports/user-repository.interface';
import { ITokenService } from '../../domain/ports/token-service.interface';
import { ICompanyRepository } from '../../../../shared/domain/repositories/company-repository.interface';
import { ICompanyMemberRepository } from '../../../../shared/domain/repositories/company-member-repository.interface';
import { User } from '../../domain/entities/user';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { PhoneNumber } from '../../domain/value-objects/phone-number';
import { UserRoleEnum } from '../../domain/value-objects/user-role';

describe('SignUpUseCase', () => {
  let signUpUseCase: SignUpUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let tokenService: jest.Mocked<ITokenService>;
  let companyRepository: jest.Mocked<ICompanyRepository>;
  let companyMemberRepository: jest.Mocked<ICompanyMemberRepository>;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      exists: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    tokenService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
    };

    companyRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByCnpj: jest.fn(),
    } as any;

    companyMemberRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByCompanyId: jest.fn(),
    } as any;

    signUpUseCase = new SignUpUseCase(
      userRepository, 
      tokenService,
      companyRepository,
      companyMemberRepository
    );
  });

  it('should successfully sign up a new user', async () => {
    // Arrange
    userRepository.exists.mockResolvedValue(false);
    companyRepository.findByCnpj.mockResolvedValue(null);
    tokenService.generateToken.mockResolvedValue('jwt-token-123');

    const request = {
      email: 'newuser@example.com',
      password: 'StrongPass123!',
      name: 'John Doe',
      phoneNumber: '11987654321',
      companyName: 'Test Company',
      cnpj: '11.222.333/0001-81', // Valid CNPJ with correct check digits
    };

    // Act
    const result = await signUpUseCase.execute(request);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(userRepository.exists).toHaveBeenCalledWith('newuser@example.com');
    expect(userRepository.save).toHaveBeenCalled();
    expect(tokenService.generateToken).toHaveBeenCalled();
    
    const response = result.getValue();
    expect(response.token).toBe('jwt-token-123');
    expect(response.user.email).toBe('newuser@example.com');
    expect(response.user.name).toBe('John Doe');
    expect(response.user.phoneNumber).toBe('+5511987654321');
    expect(response.user.role).toBe(UserRoleEnum.ENTREPRENEUR);
  });

  it('should fail when email is invalid', async () => {
    // Arrange
    const request = {
      email: 'invalid-email',
      password: 'StrongPass123!',
      name: 'John Doe',
      phoneNumber: '11987654321',
      companyName: 'Test Company',
    };

    // Act
    const result = await signUpUseCase.execute(request);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('invalid');
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should fail when user already exists', async () => {
    // Arrange
    userRepository.exists.mockResolvedValue(true);

    const request = {
      email: 'existing@example.com',
      password: 'StrongPass123!',
      name: 'John Doe',
      phoneNumber: '11987654321',
      companyName: 'Test Company',
    };

    // Act
    const result = await signUpUseCase.execute(request);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('already exists');
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should fail when password is weak', async () => {
    // Arrange
    userRepository.exists.mockResolvedValue(false);

    const request = {
      email: 'user@example.com',
      password: 'weak',
      name: 'John Doe',
      phoneNumber: '11987654321',
      companyName: 'Test Company',
    };

    // Act
    const result = await signUpUseCase.execute(request);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should fail when phoneNumber is invalid', async () => {
    // Arrange
    userRepository.exists.mockResolvedValue(false);

    const request = {
      email: 'user@example.com',
      password: 'StrongPass123!',
      name: 'John Doe',
      phoneNumber: '123', // too short
      companyName: 'Test Company',
    };

    // Act
    const result = await signUpUseCase.execute(request);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('invalid');
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should fail when name is invalid', async () => {
    // Arrange
    userRepository.exists.mockResolvedValue(false);

    const request = {
      email: 'user@example.com',
      password: 'StrongPass123!',
      name: '',
      phoneNumber: '11987654321',
      companyName: 'Test Company',
    };

    // Act
    const result = await signUpUseCase.execute(request);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('name');
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should fail when CNPJ is invalid', async () => {
    // Arrange
    userRepository.exists.mockResolvedValue(false);

    const request = {
      email: 'user@example.com',
      password: 'StrongPass123!',
      name: 'John Doe',
      phoneNumber: '11987654321',
      companyName: 'Test Company',
      cnpj: '12.345.678/0001-90', // Invalid CNPJ (wrong check digits)
    };

    // Act
    const result = await signUpUseCase.execute(request);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('CNPJ');
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should fail when CNPJ already exists', async () => {
    // Arrange
    userRepository.exists.mockResolvedValue(false);
    
    // Mock existing company with same CNPJ
    const existingCompany = {
      id: { toString: () => 'existing-company-id' },
      name: 'Existing Company',
      cnpj: { value: '11.222.333/0001-81' },
    };
    companyRepository.findByCnpj.mockResolvedValue(existingCompany as any);

    const request = {
      email: 'user@example.com',
      password: 'StrongPass123!',
      name: 'John Doe',
      phoneNumber: '11987654321',
      companyName: 'Test Company',
      cnpj: '11.222.333/0001-81', // Valid CNPJ but already exists
    };

    // Act
    const result = await signUpUseCase.execute(request);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('already exists');
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
