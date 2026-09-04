import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Numele utilizatorului',
    example: 'Elon Musk',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Adresa de email a utilizatorului',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Parola utilizatorului (minim 8 caractere)',
    minLength: 8,
    example: 'parolaMeaSecurizata123',
  })
  @IsStrongPassword()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
