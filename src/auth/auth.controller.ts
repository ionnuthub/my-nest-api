import {Body, Controller, Get, Post,Request, UseGuards} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {CreateUserDto} from "../users/dto/create-user.dto/create-user.dto";
import {LoginDto} from "./dto/login.dto/login.dto";
import {JwtAuthGuard} from "./jwt-auth.guard";
import {Roles} from "./roles.decorator";
import {RolesGuard} from "./roles.guard";



@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Roles('ADMIN')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('admin')
    getAdminArea() {
        return {
            message: 'Bine ai venit în zona administratorilor',
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(
        @Request() request: {
            user: {
                userId: number;
                email: string;
            };
        },
    ) {
        return request.user;
    }

    @Post('register')
    register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}
