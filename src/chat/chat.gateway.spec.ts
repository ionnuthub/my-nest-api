import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { ChatGateway } from './chat.gateway';

type SocketFixture = {
  client: Socket;
  emit: jest.Mock;
  disconnect: jest.Mock;
};

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  const jwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: JwtService,
          useValue: jwtService,
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
});

function createSocket(auth: Record<string, unknown> = {}): SocketFixture {
  const emit = jest.fn();
  const disconnect = jest.fn();
  const client = {
    id: 'socket-1',
    handshake: {
      auth,
      headers: {},
    },
    emit,
    disconnect,
  } as unknown as Socket;

  return { client, emit, disconnect };
}
