// src/questions/test.model.ts
export interface Blank {
    question: string;
    correctAnswer: string;
  }
  
  export interface Question {
    id: number;
    questionText: string;
    questionType: 'select' | 'ordering' | 'input';
    options?: string[];
    correctOrder?: string[];
    blanks?: Blank[];
    correctAnswer?: string;
    timeLimit: number;
  }
  
  export interface Test {
    id: string;
    name: string;
    status: 'active' | 'inactive' | 'completed';
    totalTime: number;
    questions: Question[];
  }
  