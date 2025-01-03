import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, validate } from 'class-validator';

@ValidatorConstraint({ async: false })
export class QuestionTypeValidator implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [answerField] = args.constraints;

    // Assuming `value` corresponds to either userAnswer or order array
    if (answerField === 'userAnswer') {
      // Validate string for input/select question types
      if (typeof value === 'string') {
        return true;  // Valid for string answers
      }
    } else if (answerField === 'order') {
      // Validate array for ordering question types
      if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
        return true;  // Valid for array of strings
      }
    }
    
    return false;  // Invalid if neither string nor array of strings
  }

  defaultMessage(args: ValidationArguments) {
    return `Answer must be a valid string or array of strings for ${args.property}.`;
  }
}
