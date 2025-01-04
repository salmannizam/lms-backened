import { Controller, Get, Param } from '@nestjs/common';
import { TopicsService } from './topics.service';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get('timeSpent/:userId/:topicId')
  async getTimeSpent(@Param('userId') userId: number, @Param('topicId') topicId: string) {
    return this.topicsService.getTimeSpent(userId, topicId);
  }
}
