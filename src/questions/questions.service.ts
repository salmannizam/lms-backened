import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as questionsData from './questions.json';  // Import the JSON file

@Injectable()
export class QuestionsService {
  private tests = questionsData;  // Loaded directly from the JSON file
  private activeTests: any[] = []; // Store active test sessions

  // Start the test with a generated token
  startTest(testId: string) {
    const test = this.tests.find((test: any) => test.id === testId && test.status === 'active');
    if (!test) {
      return { valid: false, message: 'Test not found or not active.' };
    }

    const token = crypto.randomBytes(16).toString('hex');
    const startTime = Date.now();
    const totalTime = test.totalTime;

    this.activeTests.push({
      token,
      testId,
      startTime,
      totalTime,
      answers: [],  // Store user answers here
      status: 'in-progress',
    });

    // Return the token and test details (without answers)
    return {
      valid: true,
      token,
      test: {
        id: test.id,
        name: test.name,
        questions: test.questions.map((q: any) => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          timeLimit: q.timeLimit,
        })),
        totalTime,
      },
    };
  }

  // Get the test details and status by token
  getTestByToken(token: string) {
    // Find the active test session by the provided token
    const testSession = this.activeTests.find((session) => session.token === token);
    
    // If no session is found, return an error message
    if (!testSession) {
      return { valid: false, message: 'Invalid or expired test session.' };
    }
  
    // Find the corresponding test data by testId from the active session
    const test = this.tests.find((test: any) => test.id === testSession.testId);
    if (!test) {
      return { valid: false, message: 'Test not found.' };
    }
  
    // Map the questions to include the user's answers (if any)
    const questionsWithAnswers = test.questions.map((q: any) => {
      const answer = testSession.answers.find((a: any) => a.questionId === q.id);
      return {
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        timeLimit: q.timeLimit,
        functions: q.functions,  
        userAnswer: answer ? answer.userAnswer : null,  // Include the user's answer if available
      };
    });
  
    // Return the test details with answers if the test has been completed
    return {
      valid: true,
      token: testSession.token,
      test: {
        id: test.id,
        name: test.name,
        questions: questionsWithAnswers,
        totalTime: testSession.totalTime,
        startTime: testSession.startTime,
      },
      status: testSession.status,  // Include the current status of the test (in-progress or completed)
      results: testSession.status === 'completed' ? testSession.answers : null,  // Include results only if the test is completed
    };
  }
  

  // Store the answers and mark test as completed once answers are submitted
  submitTest(token: string, answers: any[]) {
    const testSession = this.activeTests.find((session) => session.token === token);
    if (!testSession) {
      return { valid: false, message: 'Invalid test session.' };
    }

    if (testSession.status === 'completed') {
      return { valid: false, message: 'Test already completed.' };
    }

    // Validate and store the answers
    const test = this.tests.find((test: any) => test.id === testSession.testId);
    if (!test) {
      return { valid: false, message: 'Test not found.' };
    }

    answers.forEach(answer => {
      const question = test.questions.find((q: any) => q.id === answer.questionId);
      if (!question) {
        return { valid: false, message: 'Invalid question.' };
      }

      // Store answer
      testSession.answers.push({
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
      });
    });

    // Mark test as completed
    testSession.status = 'completed';

    return {
      valid: true,
      message: 'Test completed.',
    };
  }

  // Get a list of active tests (just names and IDs)
  getAllActiveTests() {
    return this.tests
      .filter((test: any) => test.status === 'active')
      .map((test: any) => ({
        id: test.id,
        name: test.name,
      }));
  }
}
