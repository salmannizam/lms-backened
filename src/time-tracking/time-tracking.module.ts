import { Module } from '@nestjs/common';
import { TimeTrackingGateway } from './time-tracking.gateway';

@Module({
  providers: [TimeTrackingGateway],
})
export class TimeTrackingModule {}
