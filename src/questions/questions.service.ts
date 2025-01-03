// src/questions/questions.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as questionsData from './questions.json';  // Import the JSON file
import { writeFileSync } from 'fs';  // To save results to file (optional)

@Injectable()
export class QuestionsService {
  private tests = questionsData;  // Loaded directly from the JSON file
  private activeTests: any[] = []; // Store active test sessions

  startTest(testId: string) {
    // Find the test with the provided testId and ensure it's active
    const test = this.tests.find((test: any) => test.id === testId && test.status === 'active');
    if (!test) {
      return { valid: false, message: 'Test not found or not active.' };
    }

    // Generate a unique token for the test session
    const token = crypto.randomBytes(16).toString('hex');
    const startTime = Date.now(); // Capture the start time
    const totalTime = test.totalTime; // Total time for the test

    // Add the session to the list of active tests (temporary in-memory storage for this session)
    this.activeTests.push({
      token,
      testId,
      startTime,
      totalTime,
      results: [],
      status: 'in-progress',
    });

    // Send back only essential test details (no answers)
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
          options: q.options, // Send options for multiple-choice or similar questions
          timeLimit: q.timeLimit,
        })),
        totalTime,
      },
    };
  }


  // Store answer and check if it is correct
  storeTestResult(token: string, questionId: number, userAnswer: any) {
    const testSession = this.activeTests.find((session) => session.token === token);
    if (!testSession) {
      return { valid: false, message: 'Invalid test session.' };
    }

    const test = this.tests.find((test: any) => test.id === testSession.testId);
    if (!test) {
      return { valid: false, message: 'Test not found.' };
    }

    const question = test.questions.find((q: any) => q.id === questionId);
    if (!question) {
      return { valid: false, message: 'Invalid question.' };
    }

    // Check if time expired
    const currentTime = Date.now();
    const elapsedTime = Math.floor((currentTime - testSession.startTime) / 1000); // Time in seconds

    if (elapsedTime > question.timeLimit) {
      return { valid: false, message: 'Time limit for this question has expired.' };
    }

    // Validate the answer
    const isCorrect = this.verifyAnswer(question, userAnswer);

    // Store the result
    testSession.results.push({
      questionId,
      isCorrect,
      userAnswer,
    });

    return { valid: true, isCorrect, message: isCorrect ? 'Correct answer.' : 'Incorrect answer.' };
  }


  // Mark the test as completed
  markTestCompleted(token: string) {
    const testSession = this.activeTests.find((session) => session.token === token);
    if (!testSession) {
      return { valid: false, message: 'Test session not found.' };
    }

    if (testSession.status === 'completed') {
      return { valid: false, message: 'Test already completed.' };
    }

    // Mark the test as completed
    testSession.status = 'completed';

    // Optionally, save the test results to a file (you can store in a database later)
    this.saveResultsToFile(testSession);

    return { valid: true, message: 'Test completed successfully.', results: testSession.results };
  }

  // Helper function to verify answers based on question type
  private verifyAnswer(question: any, userAnswer: any): boolean {
    switch (question.questionType) {
      case 'ordering':
        return JSON.stringify(question.correctOrder) === JSON.stringify(userAnswer.order);
      case 'select':
        return question.correctAnswer === userAnswer;
      case 'input':
        return question.correctAnswer === userAnswer;
      default:
        return false;
    }
  }

  // Save results to a JSON file (optional)
  private saveResultsToFile(testSession: any) {
    // writeFileSync(`./test-results/test_${testSession.token}.json`, JSON.stringify(testSession.results, null, 2));
  }

  // Get all active tests (for debugging or listing all available tests)
  getAllTests() {
    return this.tests
      .filter((test: any) => test.status === 'active')
      .map((test: any) => ({
        id: test.id,
        name: test.name,
      }));
  }

// Get test results by token
getTestResultsByToken(token: string) {
  const testSession = this.activeTests.find((session) => session.token === token);
  if (!testSession) {
    return { valid: false, message: 'Invalid or expired test session.' };
  }

  // Fetch test details based on the token
  const test = this.tests.find((test: any) => test.id === testSession.testId);
  if (!test) {
    return { valid: false, message: 'Test not found.' };
  }

  return {
    valid: true,
    token: testSession.token,
    test: {
      id: test.id,
      name: test.name,
      questions: test.questions.map((q: any) => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        functions: q.functions,  // Include the functions for the drag-and-drop question
        timeLimit: q.timeLimit,
      })),
      totalTime: testSession.totalTime,
      startTime: testSession.startTime,
    },
    results: testSession.results,
  };
}

  // src/questions/questions.service.ts
  getTestResults(token: string) {
    const testSession = this.activeTests.find((session) => session.token === token);
    if (!testSession) {
      return { valid: false, message: 'Invalid test session.' };
    }

    return {
      valid: true,
      results: testSession.results,
    };
  }

}
