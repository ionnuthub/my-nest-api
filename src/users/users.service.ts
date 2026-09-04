import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

type UserResponse = {
  id: number;
  name: string;
  email: string;
};

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly prisma: PrismaService,
  ) {}

  findAll(role?: 'USER' | 'ADMIN'): Promise<UserResponse[]> {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  async findOne(id: number) {
    const cacheKey = `user:${id}`;

    const cachedUser = await this.cacheManager.get<UserResponse>(cacheKey);

    if (cachedUser) {
      console.log('User from Redis cache');
      return cachedUser;
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('Utilizatorul nu a fost gasit');
    }

    console.log('User from PostgreSQL');

    await this.cacheManager.set(cacheKey, user, 60_000);

    return user;
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 12);
      return await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
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
    const userExists = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      throw new NotFoundException('Utilizatorul nu a fost gasit');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    await this.cacheManager.del(`user:${id}`);

    return updatedUser;
  }

  async delete(id: number) {
    await this.findOne(id);

    const deletedUser = await this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    await this.cacheManager.del(`user:${id}`);

    return deletedUser;
  }
}
