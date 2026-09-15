import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ChatService', () => {
  let service: ChatService;
  const prismaService = {
    chatParticipant: {
      findUnique: jest.fn(),
    },
    message: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('parses valid room ids', () => {
    expect(service.parseRoomId('1')).toBe(1);
    expect(service.parseRoomId(2)).toBe(2);
  });

  it('rejects invalid room ids', () => {
    expect(() => service.parseRoomId('general')).toThrow(BadRequestException);
  });

  it('rejects users that are not room participants', async () => {
    prismaService.chatParticipant.findUnique.mockResolvedValue(null);

    await expect(service.assertParticipant(1, 1)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('creates chat messages for room participants', async () => {
    prismaService.chatParticipant.findUnique.mockResolvedValue({ id: 1 });
    prismaService.message.create.mockResolvedValue({
      id: 10,
      content: 'Salut!',
      createdAt: new Date('2026-09-14T10:00:00.000Z'),
      userId: 1,
      user: {
        email: 'user@example.com',
      },
    });

    const message = await service.createMessage({
      roomId: 1,
      content: ' Salut! ',
      userId: 1,
      clientId: 'socket-1',
    });

    expect(prismaService.message.create).toHaveBeenCalledWith({
      data: {
        content: 'Salut!',
        userId: 1,
        chatRoomId: 1,
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
    expect(message).toEqual({
      id: 10,
      roomId: 1,
      message: 'Salut!',
      clientId: 'socket-1',
      userId: 1,
      email: 'user@example.com',
      createdAt: new Date('2026-09-14T10:00:00.000Z'),
    });
  });
});
