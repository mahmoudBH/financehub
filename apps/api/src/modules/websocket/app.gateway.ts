// ============================================
// WebSocket Gateway - Real-time Communications
// ============================================
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/ws',
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(AppGateway.name);
  private connectedClients = new Map<string, string>(); // socketId -> userId

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      const userId = payload.sub;
      this.connectedClients.set(client.id, userId);

      // Join user-specific room
      client.join(`user:${userId}`);

      this.logger.log(`Client connected: ${client.id} (user: ${userId})`);
    } catch (error) {
      this.logger.warn(`Client connection rejected: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedClients.get(client.id);
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id} (user: ${userId})`);
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Send to all connected clients (admin broadcasts)
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Notification events
  sendNotification(userId: string, notification: any) {
    this.sendToUser(userId, 'notification', notification);
  }

  // Transaction update events
  sendTransactionUpdate(userId: string, transaction: any) {
    this.sendToUser(userId, 'transaction:update', transaction);
  }

  // Transfer update events
  sendTransferUpdate(userId: string, transfer: any) {
    this.sendToUser(userId, 'transfer:update', transfer);
  }

  // Balance update events
  sendBalanceUpdate(userId: string, balance: any) {
    this.sendToUser(userId, 'balance:update', balance);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): string {
    return 'pong';
  }

  @SubscribeMessage('subscribe:dashboard')
  handleDashboardSubscribe(@ConnectedSocket() client: Socket) {
    const userId = this.connectedClients.get(client.id);
    if (userId) {
      client.join(`dashboard:${userId}`);
    }
  }
}
