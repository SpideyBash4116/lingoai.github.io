
export enum AppLanguage {
  SPANISH = 'Spanish',
  FRENCH = 'French',
  GERMAN = 'German',
  JAPANESE = 'Japanese',
  CHINESE = 'Chinese'
}

export enum UserLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  example: string;
}

export interface LessonStep {
  type: 'explanation' | 'practice' | 'quiz';
  content: string;
  question?: string;
  correctAnswer?: string;
  options?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  topic: string;
  steps: LessonStep[];
}

export interface ActivityDay {
  day: string;
  xp: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  grammarCorrection?: string;
}

export interface ProgressState {
  language: AppLanguage;
  level: UserLevel;
  experience: number;
  streak: number;
  masteredVocabulary: VocabularyWord[];
  completedLessons: string[];
  activityHistory: ActivityDay[];
  lastStudyDate: string;
}
