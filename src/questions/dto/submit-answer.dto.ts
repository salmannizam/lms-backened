import { IsNumber, IsString, IsArray, IsOptional, Validate } from 'class-validator';
import { QuestionTypeValidator } from '../validators/question-type.validator';

export class SubmitAnswerDto {
  @IsNumber()
  questionId: number;

  // Depending on the question type, we will validate userAnswer or order
  @IsOptional() 
  @IsString()
  userAnswer: string; // For 'input' or 'select' types
  
  @IsOptional() 
  @IsArray()
  @IsString({ each: true })
  order?: string[];  // For 'ordering' type questions

  // Custom validator to handle different answer types
  @Validate(QuestionTypeValidator, ['userAnswer', 'order'])  // Use custom validator to validate based on questionType
  userAnswerOrOrder?: string | string[];
}
