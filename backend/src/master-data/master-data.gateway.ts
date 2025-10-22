// src/master-data/master-data.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
  },
})
export class MasterDataGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Method untuk broadcast event ke semua client yang terhubung
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Method untuk broadcast event ke channel tertentu
  broadcastToChannel(channel: string, event: string, data: any) {
    this.server.to(channel).emit(event, data);
  }

  // Method untuk join channel
  @SubscribeMessage('join')
  handleJoinChannel(@ConnectedSocket() client: Socket, @MessageBody() channel: string) {
    console.log(`Client ${client.id} joining channel: ${channel}`);
    client.join(channel);
    return { event: 'joined', data: { channel } };
  }

  // Method untuk leave channel
  @SubscribeMessage('leave')
  handleLeaveChannel(@ConnectedSocket() client: Socket, @MessageBody() channel: string) {
    console.log(`Client ${client.id} leaving channel: ${channel}`);
    client.leave(channel);
    return { event: 'left', data: { channel } };
  }
}