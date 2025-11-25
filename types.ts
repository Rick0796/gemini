
export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  LESSON = 'LESSON',
  SIMULATION = 'SIMULATION', // The old "Red/Blue Door" is now a specific type of lesson
  REVIEW = 'REVIEW'
}

export enum CourseType {
  RED = 'RED',   // Emotional/Dating
  BLUE = 'BLUE'  // Logical/Business
}

export enum LessonType {
  THEORY = 'THEORY',      // Text + Examples
  CASE_STUDY = 'CASE_STUDY', // Analysis
  QUIZ = 'QUIZ',          // Multiple choice / Rewrite
  BOSS_FIGHT = 'BOSS_FIGHT' // The Chat Simulation
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  description: string;
  content: {
    theory?: string;
    key_concepts?: string[];
    bad_example?: string;
    good_example?: string;
    why_it_works?: string;
    quiz_question?: string;
    quiz_options?: { text: string; isCorrect: boolean; feedback: string }[];
  };
  locked: boolean;
  completed: boolean;
  xp_reward: number;
}

export interface CourseModule {
  id: string;
  title: string;
  level: number;
  lessons: Lesson[];
}

// Keeping existing types for the Simulation part
export interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export interface CoachMessage {
  id: string;
  sender: 'user' | 'coach';
  content: string;
  isThinking?: boolean;
}

export interface GeminiResponse {
  reply: string;
  analysis: {
    score: number;
    trustLevel: number;
    coach_comment: string;
    suggestion: string;
    suggested_reply_options?: string[];
    sentiment_tag?: string;
  };
}

export interface TacticGenerationResponse {
  generatedText: string;
}

export interface SessionReport {
  score: number;
  radarData: RadarData[];
  fatal_errors: string[];
  mvp_line: string;
  training_plan: string;
}

export interface RadarData {
  subject: string;
  A: number;
  fullMark: number;
}
