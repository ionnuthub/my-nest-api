import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-room')
  handleJoinRoom(
      @MessageBody() roomId: string,
      @ConnectedSocket() client: Socket,
  ) {
    client.join(roomId);

    client.emit('joined-room', {
      roomId,
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
  ) {
    this.server.to(data.roomId).emit('new-message', {
      roomId: data.roomId,
      message: data.message,
      clientId: client.id,
    });
  }
}