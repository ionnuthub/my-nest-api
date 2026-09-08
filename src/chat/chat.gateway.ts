import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

type JwtPayload = {
  sub: number;
  email: string;
  role: string;
};

type AuthenticatedUser = {
  userId: number;
  email: string;
  role: string;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly connectedUsers = new Map<string, AuthenticatedUser>();

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket): Promise<void> {
    const token = this.extractToken(client);

    if (!token) {
      this.rejectClient(client);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      this.connectedUsers.set(client.id, {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      });
    } catch {
      this.rejectClient(client);
    }
  }

  handleDisconnect(client: Socket): void {
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    const user = this.getAuthenticatedUser(client);

    if (!user) {
      return;
    }

    void client.join(roomId);

    client.emit('joined-room', {
      roomId,
      userId: user.userId,
    });
  }

  @SubscribeMessage('send-message')
  handleSendMessage(
    @MessageBody()
    data: {
      roomId: string;
      message: string;
    },
    @ConnectedSocket() client: Socket,
  ): void {
    const user = this.getAuthenticatedUser(client);

    if (!user) {
      return;
    }

    this.server.to(data.roomId).emit('new-message', {
      roomId: data.roomId,
      message: data.message,
      clientId: client.id,
      userId: user.userId,
      email: user.email,
    });
  }

  private getAuthenticatedUser(client: Socket): AuthenticatedUser | null {
    const user = this.connectedUsers.get(client.id);

    if (!user) {
      this.rejectClient(client);
      return null;
    }

    return user;
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth as Record<string, unknown>;
    const authToken = auth.token;

    if (typeof authToken === 'string') {
      return this.normalizeToken(authToken);
    }

    const authorization = client.handshake.headers.authorization;

    if (typeof authorization === 'string') {
      return this.normalizeToken(authorization);
    }

    if (Array.isArray(authorization) && typeof authorization[0] === 'string') {
      return this.normalizeToken(authorization[0]);
    }

    return null;
  }

  private normalizeToken(value: string): string | null {
    const token = value.replace(/^Bearer\s+/i, '').trim();

    return token.length > 0 ? token : null;
  }

  private rejectClient(client: Socket): void {
    client.emit('auth-error', {
      message: 'Token JWT lipsa sau invalid.',
    });

    client.disconnect(true);
  }
}
