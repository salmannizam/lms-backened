import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { QuestionsService } from './questions.service';

@Controller('test')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  // Start a new test and return a token
  @Post('start/:testId')
  startTest(@Param('testId') testId: string) {
    return this.questionsService.startTest(testId);
  }

  // Get test details and status using the token
  @Get('get/:token')
  getTestByToken(@Param('token') token: string) {
    return this.questionsService.getTestByToken(token);
  }

  // Submit answers for the test by token
  @Post('submit/:token')
  submitTest(
    @Param('token') token: string,
    @Body() answers: any[],
  ) {
    return this.questionsService.submitTest(token, answers);
  }

  // Get all active tests (names and IDs only)
  @Get('active')
  getActiveTests() {
    return this.questionsService.getAllActiveTests();
  }
}
