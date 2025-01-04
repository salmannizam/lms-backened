import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsGateway } from './topics.gateway';
import { TopicsController } from './topics.controller';

@Module({
  providers: [TopicsService, TopicsGateway],
  controllers: [TopicsController],
})
export class TopicsModule {}
