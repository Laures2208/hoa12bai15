export type QuestionType = 'theory' | 'exercise';

export interface Question {
  id: string;
  content: string;
  type: QuestionType;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  image?: string;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  timeCompleted: number; // in seconds
  timestamp: number;
}

export type ExamPackage = 'basic' | 'advanced';

export interface ExamConfig {
  totalQuestions: number;
  timeLimit: number; // in minutes
}

export const EXAM_CONFIGS: Record<ExamPackage, ExamConfig> = {
  basic: { totalQuestions: 22, timeLimit: 22 },
  advanced: { totalQuestions: 45, timeLimit: 45 },
};
