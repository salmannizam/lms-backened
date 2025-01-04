import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface UserTimeTracking {
  [topicId: string]: { startTime: number; totalTime: number };
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173', // Your frontend URL
  },
})
export class TimeTrackingGateway implements OnGatewayInit, OnGatewayDisconnect {
  private readonly logger = new Logger(TimeTrackingGateway.name);
  private userTimeTracking: { [userId: string]: UserTimeTracking } = {};
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();

  afterInit() {
    this.logger.log('WebSocket Gateway Initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clearTimers(client.id);
  }
  
  

  @SubscribeMessage('startTopic')
  startTopic(
    @MessageBody() { userId, topicId }: { userId: string; topicId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    if (!userId || !topicId) {
      this.logger.warn('Missing userId or topicId');
      return;
    }
  
    const requestTime = new Date().toISOString(); // Log the time of the request
    this.logger.log(`Start request received at: ${requestTime} for user: ${userId}, topic: ${topicId}`);
  
    this.logger.log(`Received startTopic for user: ${userId}, topic: ${topicId}`);
    this.clearUserTimers(userId); // Clear all timers for the user
  
    if (!this.userTimeTracking[userId]) {
      this.userTimeTracking[userId] = {};
    }
   
    const userTracking = this.userTimeTracking[userId];
    const existingData = userTracking[topicId];
  
    if (existingData) {
      this.logger.log(
        `Resuming tracking for user: ${userId}, topic: ${topicId}, current time: ${existingData.totalTime}s`,
      );
      userTracking[topicId].startTime = Date.now(); // Restart the timer
    } else {
      this.logger.log(`Starting new tracking for user: ${userId}, topic: ${topicId}`);
      userTracking[topicId] = { startTime: Date.now(), totalTime: 0 };
    }
  
    const totalTime = userTracking[topicId].totalTime;
    socket.emit('timeUpdate', totalTime); // Send the initial time to the client
  
    this.startTrackingTime(userId, topicId, socket);
  }
  

  @SubscribeMessage('stopTopic')
  stopTopic(
    @MessageBody() { userId, topicId }: { userId: string; topicId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    if (!userId || !topicId) {
      this.logger.warn('Missing userId or topicId');
      return;
    }
  
    const requestTime = new Date().toISOString(); // Log the time of the request
    this.logger.log(`Stop request received at: ${requestTime} for user: ${userId}, topic: ${topicId}`);
  
    this.logger.log(`Received stopTopic for user: ${userId}, topic: ${topicId}`);
    this.stopUserTopicTimer(userId, topicId, socket);
  }
  

  private startTrackingTime(userId: string, topicId: string, socket: Socket) {
    const timerId = `${userId}-${topicId}`;
    this.clearTimer(timerId); // Ensure no duplicate timers for this topic

    const interval = setInterval(() => {
      const userTracking = this.userTimeTracking[userId];
      if (userTracking && userTracking[topicId]) {
        const trackingData = userTracking[topicId];
        const elapsedTime = Math.floor((Date.now() - trackingData.startTime) / 1000);
        trackingData.totalTime += elapsedTime;
        trackingData.startTime = Date.now(); // Update only after computing
        socket.emit('timeUpdate', trackingData.totalTime);
      }
    }, 1000);
    

    this.activeTimers.set(timerId, interval);
    this.logger.log(`Started timer for user: ${userId}, topic: ${topicId}`);
  }

  private clearTimer(timerId: string) {
    if (this.activeTimers.has(timerId)) {
      clearInterval(this.activeTimers.get(timerId));
      this.activeTimers.delete(timerId);
      this.logger.log(`Cleared timer: ${timerId}`);
    } else {
      this.logger.log(`No timer found to clear for: ${timerId}`);
    }
  }

  private clearTimers(socketId: string) {
    this.activeTimers.forEach((_, key) => {
      if (key.includes(socketId)) {
        this.clearTimer(key); // Clear only relevant timers
      }
    });
  }
  
  private clearUserTimers(userId: string) {
    this.activeTimers.forEach((_, key) => {
      if (key.startsWith(userId)) {
        this.clearTimer(key);
      }
    });
  }
  

  private stopUserTopicTimer(userId: string, topicId: string, socket: Socket) {
    const timerId = `${userId}-${topicId}`;
    const userTracking = this.userTimeTracking[userId];
  
    if (userTracking && userTracking[topicId]) {
      const trackingData = userTracking[topicId];
      const elapsedTime = Math.floor((Date.now() - trackingData.startTime) / 1000);
      trackingData.totalTime += elapsedTime;
      socket.emit('timeUpdate', trackingData.totalTime);
  
      this.logger.log(
        `Paused tracking for user: ${userId}, topic: ${topicId}, totalTime: ${trackingData.totalTime}s`,
      );
  
      this.clearTimer(timerId); // Clear timer
    }
  }
  
  
}