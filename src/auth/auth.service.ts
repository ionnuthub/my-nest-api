import { Injectable,UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {UsersService} from "../users/users.service";
import {CreateUserDto} from "../users/dto/create-user.dto/create-user.dto";
import {LoginDto} from "./dto/login.dto/login.dto";
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(private readonly userService: UsersService, private readonly jwtService: JwtService) {}

    register(createUserDto:CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    async login(loginDto:LoginDto) {
        const user = await this.userService.findByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Email sau parolă incorectă');
        }

        const passwordMatches = await bcrypt.compare(loginDto.password,user.password)

        if (!passwordMatches) {
            throw new UnauthorizedException('Email sau parolă incorectă');
        }

        const payload = {
            sub: user.id,
            email: user.email,
        };

        return {
            accessToken: await this.jwtService.signAsync(payload),
        };
    }

}
