import { ClassroomConfig } from '../types';

export const GRADE_OPTIONS = [
  'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
];

export const SUBJECT_OPTIONS = [
  'Business', 'Technology', 'Economics', 'ELA', 'Math', 'Science', 
  'Social Studies', 'CTE', 'Computer Science', 'Art', 'Music', 'PE'
];

export const STANDARDS_OPTIONS = [
  { value: 'TN', label: 'TN Standards' },
  { value: 'CCSS', label: 'Common Core' },
  { value: 'NGSS', label: 'Next Gen Science' },
  { value: 'ISTE', label: 'ISTE Standards' },
  { value: 'MO', label: 'MO Standards' },
  { value: 'KS', label: 'KS Standards' },
  { value: 'Custom', label: 'Custom' }
];

export const DEFAULT_CONFIG: ClassroomConfig = {
  level: 'High',
  grades: '10',
  subjects: 'Economics',
  standards: { type: 'TN' },
  outputDepth: 'Standard',
  readingLevel: 10,
  differentiation: { ell: false, iep504: false, extension: false },
  include: { 
    objectives: true, 
    materials: true, 
    timing: true, 
    checks: true, 
    rubrics: false, 
    citations: false 
  },
  teacherTone: 'ConversationalFriendly',
  studentTone: 'SupportiveNeutral'
};

export const TEACHER_STARTERS = [
  "Create a 55-minute lesson plan with objectives using Bloom verbs, 3 activities (Do Now, Mini-Lesson, Practice), materials list, checks for understanding, and an exit ticket.",
  "Generate a 15-question quiz with multiple choice, short answer, and application questions. Include an answer key with explanations.",
  "Design a 2-week project with clear milestones, deliverables, rubric, and presentation requirements.",
  "Create differentiated materials with supports for English Language Learners, including sentence frames and vocabulary aids.",
  "Write a parent communication note explaining our upcoming unit with tips for supporting learning at home.",
  "Develop a formative assessment activity to check student understanding mid-lesson.",
  "Create a worksheet with practice problems that reinforce today's learning objectives."
];

export const STUDENT_STARTERS = [
  "Walk me through this concept step by step. Ask me quick check questions as we go.",
  "I'm struggling with this topic. Can you give me examples and practice problems to work through?",
  "Help me organize my thoughts for a presentation. What should I include and how should I structure it?",
  "Explain this concept in simple terms with examples I can relate to from everyday life.",
  "I need help understanding this problem. Can you break it down into smaller steps?",
  "Can you help me study for my upcoming test? What are the key points I should focus on?",
  "I'm working on homework and got stuck. Can you guide me without giving me the direct answer?"
];