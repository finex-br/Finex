import { IsEmail, IsString, MinLength, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRoleEnum } from '../../../domain/value-objects/user-role';

export class SignUpViewModel {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password: string;

  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @IsEnum(UserRoleEnum, { message: 'Tipo de usuário inválido' })
  @IsNotEmpty({ message: 'Tipo de usuário é obrigatório' })
  role: UserRoleEnum;
}
