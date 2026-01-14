import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SignUpUseCase } from '../../../application/use-cases/sign-up.use-case';
import { SignInUseCase } from '../../../application/use-cases/sign-in.use-case';
import { SignUpViewModel } from '../view-models/sign-up.view-model';
import { SignInViewModel } from '../view-models/sign-in.view-model';
import { AuthResponseViewModel } from '../view-models/auth-response.view-model';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
  ) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'User registration',
    description: 'Register a new user with email and password',
  })
  @ApiBody({ type: SignUpViewModel })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseViewModel,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or email already exists',
  })
  async signUp(@Body() body: SignUpViewModel): Promise<AuthResponseViewModel> {
    const result = await this.signUpUseCase.execute({
      email: body.email,
      password: body.password,
      name: body.name,
      phoneNumber: body.phoneNumber,
      companyName: body.companyName,
      cnpj: body.cnpj,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    return result.getValue();
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password',
  })
  @ApiBody({ type: SignInViewModel })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully',
    type: AuthResponseViewModel,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid credentials',
  })
  async signIn(@Body() body: SignInViewModel): Promise<AuthResponseViewModel> {
    const result = await this.signInUseCase.execute({
      email: body.email,
      password: body.password,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    return result.getValue();
  }
}
