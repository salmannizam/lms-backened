import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsResponse,
} from '@nestjs/websockets';
import { TopicsService } from './topics.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: "*",  // Allow all origins for development (adjust for production)
  },
})
export class TopicsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('TopicsGateway');

  constructor(private readonly topicsService: TopicsService) {}

  afterInit() {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: any) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('startSession')
  async handleStartSession(
    @MessageBody() { userId, topicId }: { userId: number; topicId: string },
  ): Promise<WsResponse<any>> {
    const session = await this.topicsService.startSession(userId, topicId);
    return { event: 'sessionStarted', data: session };
  }

  @SubscribeMessage('updateTime')
  async handleTimeUpdate(
    @MessageBody() { userId, topicId, timeSpent }: { userId: number; topicId: string; timeSpent: number },
  ): Promise<WsResponse<any>> {
    const updatedSession = await this.topicsService.updateTimeSpent(userId, topicId, timeSpent);
    return { event: 'timeUpdated', data: updatedSession };
  }

  @SubscribeMessage('finalizeSession')
  async handleFinalizeSession(
    @MessageBody() { userId, topicId, timeSpent }: { userId: number; topicId: string; timeSpent: number },
  ): Promise<WsResponse<any>> {
    const finalizedSession = await this.topicsService.finalizeSession(userId, topicId, timeSpent);
    return { event: 'sessionFinalized', data: finalizedSession };
  }

  @SubscribeMessage('getTimeSpent')
  async handleGetTimeSpent(
    @MessageBody() { userId, topicId }: { userId: number; topicId: string },
  ): Promise<WsResponse<any>> {
    const timeSpent = await this.topicsService.getTimeSpent(userId, topicId);
    return { event: 'timeSpent', data: { userId, topicId, timeSpent } };
  }
}
