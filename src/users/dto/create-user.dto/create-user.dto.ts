import {IsEmail, IsNotEmpty, IsString, IsStrongPassword, MinLength,} from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsStrongPassword()
    @IsNotEmpty()
    @MinLength(8)
    password: string;
}
