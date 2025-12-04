import { SignInUseCase } from './sign-in.use-case';
import { IUserRepository } from '../../domain/ports/user-repository.interface';
import { ITokenService } from '../../domain/ports/token-service.interface';
import { User } from '../../domain/entities/user';
import { Email } from '../../domain/value-objects/email';
import { Password } from '../../domain/value-objects/password';
import { UserRole } from '../../domain/value-objects/user-role';

describe('SignInUseCase', () => {
  let signInUseCase: SignInUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let tokenService: jest.Mocked<ITokenService>;

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

    signInUseCase = new SignInUseCase(userRepository, tokenService);
  });

  it('should successfully sign in with valid credentials', async () => {
    // Arrange
    const email = Email.create('user@example.com').getValue();
    const password = (await Password.create('StrongPass123!')).getValue();
    const role = UserRole.create('ENTREPRENEUR').getValue();
    
    const user = User.create({
      email,
      password,
      name: 'John Doe',
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).getValue();

    userRepository.findByEmail.mockResolvedValue(user);
    tokenService.generateToken.mockResolvedValue('jwt-token-456');

    const request = {
      email: 'user@example.com',
      password: 'StrongPass123!',
    };

    // Act
    const result = await signInUseCase.execute(request);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(tokenService.generateToken).toHaveBeenCalled();
    
    const response = result.getValue();
    expect(response.token).toBe('jwt-token-456');
    expect(response.user.email).toBe('user@example.com');
  });

  it('should fail when user does not exist', async () => {
    // Arrange
    userRepository.findByEmail.mockResolvedValue(null);

    const request = {
      email: 'nonexistent@example.com',
      password: 'StrongPass123!',
    };

    // Act
    const result = await signInUseCase.execute(request);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Invalid credentials');
    expect(tokenService.generateToken).not.toHaveBeenCalled();
  });

  it('should fail when password is incorrect', async () => {
    // Arrange
    const email = Email.create('user@example.com').getValue();
    const password = (await Password.create('StrongPass123!')).getValue();
    const role = UserRole.create('ENTREPRENEUR').getValue();
    
    const user = User.create({
      email,
      password,
      name: 'John Doe',
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).getValue();

    userRepository.findByEmail.mockResolvedValue(user);

    const request = {
      email: 'user@example.com',
      password: 'WrongPassword456!',
    };

    // Act
    const result = await signInUseCase.execute(request);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('Invalid credentials');
    expect(tokenService.generateToken).not.toHaveBeenCalled();
  });

  it('should fail when user is inactive', async () => {
    // Arrange
    const email = Email.create('user@example.com').getValue();
    const password = (await Password.create('StrongPass123!')).getValue();
    const role = UserRole.create('ENTREPRENEUR').getValue();
    
    const user = User.create({
      email,
      password,
      name: 'John Doe',
      role,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).getValue();

    userRepository.findByEmail.mockResolvedValue(user);

    const request = {
      email: 'user@example.com',
      password: 'StrongPass123!',
    };

    // Act
    const result = await signInUseCase.execute(request);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.error).toContain('inactive');
    expect(tokenService.generateToken).not.toHaveBeenCalled();
  });
});
