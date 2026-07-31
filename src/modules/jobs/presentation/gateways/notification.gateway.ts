import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`[WEBSOCKET] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[WEBSOCKET] Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribeTask')
  handleSubscribeTask(@ConnectedSocket() client: Socket, @MessageBody() data: { taskId: string }) {
    if (data && data.taskId) {
      client.join(data.taskId);
      this.logger.log(`[WEBSOCKET] Client ${client.id} subscribed to task room: ${data.taskId}`);
      return { status: 'subscribed', taskId: data.taskId };
    }
  }

  public sendTaskProgress(taskId: string, progress: number, message: string, downloadUrl?: string) {
    this.logger.log(`[WEBSOCKET BROADCAST] Room: ${taskId} | Progress: ${progress}% | ${message}`);
    this.server.to(taskId).emit('reportProgress', {
      taskId,
      progress,
      message,
      downloadUrl,
      timestamp: new Date(),
    });

    // Also broadcast globally so all connected clients receive real-time task updates
    this.server.emit('globalProgress', {
      taskId,
      progress,
      message,
      downloadUrl,
      timestamp: new Date(),
    });
  }
}
