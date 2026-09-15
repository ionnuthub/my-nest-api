import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatMessageResponseDto } from './dto/chat-message-response.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  parseRoomId(value: number | string): number {
    const roomId = Number(value);

    if (!Number.isInteger(roomId) || roomId <= 0) {
      throw new BadRequestException('Camera de chat este invalida.');
    }

    return roomId;
  }

  async assertParticipant(userId: number, roomId: number): Promise<void> {
    const participant = await this.prisma.chatParticipant.findUnique({
      where: {
        userId_chatRoomId: {
          userId,
          chatRoomId: roomId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!participant) {
      throw new ForbiddenException('Nu ai acces la aceasta camera de chat.');
    }
  }

  async createMessage(
    input: CreateMessageDto,
  ): Promise<ChatMessageResponseDto> {
    const content = input.content.trim();

    if (content.length === 0) {
      throw new BadRequestException('Mesajul nu poate fi gol.');
    }

    await this.assertParticipant(input.userId, input.roomId);

    const message = await this.prisma.message.create({
      data: {
        content,
        userId: input.userId,
        chatRoomId: input.roomId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return {
      id: message.id,
      roomId: input.roomId,
      message: message.content,
      clientId: input.clientId,
      userId: message.userId,
      email: message.user.email,
      createdAt: message.createdAt,
    };
  }
}
