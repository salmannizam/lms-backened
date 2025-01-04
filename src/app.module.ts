import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuestionsModule } from './questions/questions.module';
import { TopicsModule } from './topics/topics.module';
import { AuthModule } from './auth/auth.module';
import { TimeTrackingModule } from './time-tracking/time-tracking.module';

@Module({
  imports: [QuestionsModule, TopicsModule, AuthModule, TimeTrackingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
