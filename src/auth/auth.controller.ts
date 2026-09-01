import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto/create-user.dto';
import { LoginDto } from './dto/login.dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accesează zona de administrator' })
  @ApiOkResponse({
    description: 'Utilizatorul are rol de administrator',
    schema: {
      example: {
        message: 'Bine ai venit în zona administratorilor',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT lipsă sau invalid' })
  @ApiForbiddenResponse({ description: 'Utilizatorul nu are rolul ADMIN' })
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('admin')
  getAdminArea() {
    return {
      message: 'Bine ai venit în zona administratorilor',
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Returnează profilul utilizatorului autentificat' })
  @ApiOkResponse({
    description: 'Profilul extras din tokenul JWT',
    schema: {
      example: {
        userId: 1,
        email: 'user@example.com',
        role: 'USER',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT lipsă sau invalid' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(
    @Request()
    request: {
      user: {
        userId: number;
        email: string;
      };
    },
  ) {
    return request.user;
  }

  @ApiOperation({ summary: 'Înregistrează un utilizator nou' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'Utilizator creat cu succes',
    schema: {
      example: {
        id: 1,
        name: 'Elon Musk',
        email: 'john@example.com',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Date de înregistrare invalide' })
  @ApiResponse({ status: 409, description: 'Emailul este deja folosit' })
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiOperation({
    summary: 'Autentifică un utilizator și returnează un token JWT',
  })
  @ApiBody({ type: LoginDto })
  @Post('login')
  @ApiCreatedResponse({
    description: 'Autentificare reușită',
    schema: { example: { accessToken: 'jwt.token.example' } },
  })
  @ApiBadRequestResponse({ description: 'Email sau parolă lipsă/invalidă' })
  @ApiUnauthorizedResponse({ description: 'Credențiale incorecte' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
