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

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface PostLike {
  id: string;
  postId: string;
  authorId: string;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface AnnouncementLike {
  id: string;
  announcementId: string;
  authorId: string;
  createdAt: string;
}

export interface AnnouncementComment {
  id: string;
  announcementId: string;
  authorId: string;
  content: string;
  createdAt: string;
}
