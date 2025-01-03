// src/questions/questions.controller.ts
import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Controller('test')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) { }

  @Post('start/:testId')
  startTest(@Param('testId') testId: string) {
    return this.questionsService.startTest(testId);
  }

  @Get('get/:token')
  getTestResultsByToken(@Param('token') token: string) {
    return this.questionsService.getTestResultsByToken(token);
  }

  
  
  @Post('submit/:token')
  submitAnswer(
    @Param('token') token: string,
    @Body() answerData: any,
  ) {
    return this.questionsService.storeTestResult(token, answerData.questionId, answerData.userAnswer);
  }

  @Post('end/:token')
  completeTest(@Param('token') token: string) {
    return this.questionsService.markTestCompleted(token);
  }

  @Get('active')
  getActiveTests() {
    return this.questionsService.getAllTests();
  }

  // src/questions/questions.controller.ts
  @Get('results/:token')
  getResults(@Param('token') token: string) {
    return this.questionsService.getTestResults(token);
  }

}
