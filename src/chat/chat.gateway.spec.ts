import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

type SocketFixture = {
  client: Socket;
  emit: jest.Mock;
  disconnect: jest.Mock;
  join: jest.Mock;
};

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  const jwtService = {
    verifyAsync: jest.fn(),
  };
  const chatService = {
    parseRoomId: jest.fn(),
    assertParticipant: jest.fn(),
    createMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ChatService,
          useValue: chatService,
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('authenticates socket connections with JWT', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      email: 'user@example.com',
      role: 'USER',
    });
    const { client, disconnect } = createSocket({ token: 'jwt-token' });

    await gateway.handleConnection(client);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('jwt-token');
    expect(disconnect).not.toHaveBeenCalled();
  });

  it('disconnects socket connections without JWT', async () => {
    const { client, emit, disconnect } = createSocket();

    await gateway.handleConnection(client);

    expect(emit).toHaveBeenCalledWith('auth-error', {
      message: 'Token JWT lipsa sau invalid.',
    });
    expect(disconnect).toHaveBeenCalledWith(true);
  });

  it('joins an authenticated socket to a chat room', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      email: 'user@example.com',
      role: 'USER',
    });
    chatService.parseRoomId.mockReturnValue(1);
    chatService.assertParticipant.mockResolvedValue(undefined);
    const { client, join, emit } = createSocket({ token: 'jwt-token' });

    await gateway.handleConnection(client);
    await gateway.handleJoinRoom({ roomId: '1' }, client);

    expect(chatService.assertParticipant).toHaveBeenCalledWith(1, 1);
    expect(join).toHaveBeenCalledWith('1');
    expect(emit).toHaveBeenCalledWith('joined-room', {
      roomId: 1,
      userId: 1,
    });
  });
});

function createSocket(auth: Record<string, unknown> = {}): SocketFixture {
  const emit = jest.fn();
  const disconnect = jest.fn();
  const join = jest.fn().mockResolvedValue(undefined);
  const client = {
    id: 'socket-1',
    handshake: {
      auth,
      headers: {},
    },
    emit,
    disconnect,
    join,
  } as unknown as Socket;

  return { client, emit, disconnect, join };
}
