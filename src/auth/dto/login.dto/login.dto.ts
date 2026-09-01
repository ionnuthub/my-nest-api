import {IsEmail, IsString} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";


export class LoginDto {
    @ApiProperty({
        description: 'Adresa de email a utilizatorului',
        example: 'user@example.com'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Parola utilizatorului',
        example: 'parolaMeaSecurizata123'
    })
    @IsString()
    password: string;
}
