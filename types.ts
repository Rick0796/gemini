
export enum AppMode {
  DASHBOARD = 'DASHBOARD',
  LESSON = 'LESSON',
  SIMULATION = 'SIMULATION',
  REVIEW = 'REVIEW'
}

export enum CourseType {
  RED = 'RED',   // Emotional/Dating
  BLUE = 'BLUE'  // Logical/Business
}

export enum LessonType {
  THEORY = 'THEORY',      
  CASE_STUDY = 'CASE_STUDY', 
  QUIZ = 'QUIZ',          
  BOSS_FIGHT = 'BOSS_FIGHT'
}

// New Interface for a single "Page" of content
export interface LessonPage {
  title: string;
  content: string; // Markdown-supported long text
  type: 'text' | 'case_analysis' | 'key_takeaway' | 'ai_practice'; // Added ai_practice
  practice_id?: string; // Identifier for the practice scenario used by AI to grade
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  description: string;
  
  // v2.0 Data Structure: Array of Pages
  pages: LessonPage[]; 

  // Legacy/Quiz fields
  quiz_data?: {
    question: string;
    options: { text: string; isCorrect: boolean; feedback: string }[];
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

export interface PracticeResult {
  score: number;
  feedback: string;
  sentiment: 'GOOD' | 'BAD' | 'NEUTRAL';
}
