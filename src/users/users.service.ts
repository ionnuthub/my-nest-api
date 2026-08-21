import {Injectable, NotFoundException, ConflictException} from '@nestjs/common';
import {CreateUserDto} from "./dto/create-user.dto/create-user.dto";
import {UpdateUserDto} from "./dto/update-user.dto/update-user.dto";
import  {PrismaService} from "../prisma/prisma.service";
import { Prisma } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

    constructor(private readonly prisma: PrismaService) {
    }

    findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
            }
        })
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({where: {id}, select: {id: true,name: true, email: true}});

        if (!user) {
            throw new NotFoundException('Utilizatorul nu a fost gasit');
        }
        return user;
    }

    async findByEmail(email: string) {
        return await this.prisma.user.findUnique({where: {email}})
    }

   async create(createUserDto: CreateUserDto) {
        try {
            const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
            return await this.prisma.user.create(
                {
                    data: {
                        name:createUserDto.name,
                        email: createUserDto.email,
                        password: hashedPassword
                    },
                    select: {
                        id:true,
                        name:true,
                        email:true,
                    }
                }
            );
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Emailul este deja folosit');
            }

            throw error;

        }

    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        this.prisma.user.findUnique({
            where: { id },
        });

        return this.prisma.user.update({
            where: {id},
            data: updateUserDto,
        });
    }

    async delete(id: number) {
        await this.findOne(id);

        return this.prisma.user.delete({where: {id}});
    }
}