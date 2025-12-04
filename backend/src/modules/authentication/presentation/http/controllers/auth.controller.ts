import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { SignUpUseCase } from '../../../application/use-cases/sign-up.use-case';
import { SignInUseCase } from '../../../application/use-cases/sign-in.use-case';
import { SignUpViewModel } from '../view-models/sign-up.view-model';
import { SignInViewModel } from '../view-models/sign-in.view-model';
import { AuthResponseViewModel } from '../view-models/auth-response.view-model';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
  ) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() body: SignUpViewModel): Promise<AuthResponseViewModel> {
    const result = await this.signUpUseCase.execute({
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.role,
    });

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }

    return result.getValue();
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
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
