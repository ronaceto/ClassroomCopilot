export interface ClassroomConfig {
  level: 'Elementary' | 'Middle' | 'High';
  grades: string;
  subjects: string;
  standards: {
    type: 'TN' | 'CCSS' | 'NGSS' | 'ISTE' | 'Custom' | null;
    customText?: string;
  };
  outputDepth: 'Quick' | 'Standard' | 'Detailed';
  readingLevel: number;
  differentiation: {
    ell: boolean;
    iep504: boolean;
    extension: boolean;
  };
  include: {
    objectives: boolean;
    materials: boolean;
    timing: boolean;
    checks: boolean;
    rubrics: boolean;
    citations: boolean;
  };
  teacherTone: 'ConversationalFriendly';
  studentTone: 'SupportiveNeutral';
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface ChatResponse {
  assistantMessages: ChatMessage[];
  artifacts: {
    lessonPlan?: string;
    quiz?: string;
    test?: string;
    project?: string;
    worksheet?: string;
    rubric?: string;
    parentNote?: string;
  };
  meta?: {
    functionVersion?: string;
  };
}

export interface ArtifactHistory {
  id: string;
  timestamp: number;
  type: string;
  content: string;
}

export type Mode = 'teacher' | 'student';
export type ArtifactType = 'lessonPlan' | 'quiz' | 'test' | 'project' | 'worksheet' | 'rubric' | 'parentNote';