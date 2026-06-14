import React, { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  AlertTriangle,
  BookOpen,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clipboard,
  ClipboardList,
  FileText,
  Gauge,
  GraduationCap,
  HelpCircle,
  Eye,
  Languages,
  LockKeyhole,
  Library,
  Layers3,
  LibraryBig,
  Presentation,
  Printer,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { useChat } from './hooks/useChat';
import { ClassroomConfig } from './types';
import { CopyTemplate, buildLmsAssignmentCopy, copyToClipboard, exportToHtml, exportToMarkdown, exportToPptx, printFormattedDocument } from './utils/documentExport';
import curriculumDataJson from '../curriculum-map/data/modules.json';
import curriculumWorkflowJson from '../product-planning/data/build-workflow-config.json';
import courseWorkflowJson from '../product-planning/data/build-college-course-config.json';

type BuilderMode = 'curriculum-pack' | 'college-course' | 'college-program';
type FontScale = 'standard' | 'large' | 'extra-large';

interface SavedPackage {
  id: string;
  title: string;
  mode: BuilderMode;
  content: string;
  status: ReviewStatus;
  createdAt: number;
}

type ReviewStatus = 'Draft' | 'Needs Review' | 'Faculty Review' | 'Advisory Review' | 'Ready to Share';

interface CurriculumModule {
  id: string;
  chapter: number;
  title: string;
  startPage: number;
  essentialQuestion: string;
  objectives: string[];
  vocabulary: string[];
  activity: string;
  assessment: string;
  guardrails: string[];
}

interface CurriculumUnit {
  id: string;
  title: string;
  goal: string;
  modules: CurriculumModule[];
}

interface CurriculumData {
  units: CurriculumUnit[];
}

interface OptionItem {
  value: string;
  label: string;
  description?: string;
  deliverables?: string[];
  includedOutputs?: string[];
}

interface WorkflowField {
  id: string;
  options?: Array<string | OptionItem>;
}

interface WorkflowSection {
  id: string;
  fields: WorkflowField[];
}

interface WorkflowConfig {
  title: string;
  subtitle: string;
  sections: WorkflowSection[];
}

interface BuilderStep {
  title: string;
  description: string;
  complete: boolean;
  content: React.ReactNode;
}

const curriculumData = curriculumDataJson as CurriculumData;
const curriculumWorkflow = curriculumWorkflowJson as WorkflowConfig;
const courseWorkflow = courseWorkflowJson as WorkflowConfig;

const modes: Array<{
  id: BuilderMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'curriculum-pack', label: 'Curriculum Pack', icon: BookOpen },
  { id: 'college-course', label: 'College Course', icon: GraduationCap },
  { id: 'college-program', label: 'College Program', icon: Layers3 },
];

const baseConfig: ClassroomConfig = {
  level: 'High',
  grades: '10',
  subjects: 'AI Literacy',
  standards: { type: 'ISTE' },
  outputDepth: 'Detailed',
  readingLevel: 10,
  differentiation: { ell: true, iep504: true, extension: true },
  include: {
    objectives: true,
    materials: true,
    timing: true,
    checks: true,
    rubrics: true,
    citations: false,
  },
  teacherTone: 'ConversationalFriendly',
  studentTone: 'SupportiveNeutral',
};

const studentAccessNotes: Record<string, string> = {
  no_student_ai: 'Printable, teacher-led, or discussion-based activities without direct student AI access.',
  teacher_demo_ai: 'Teacher demonstrates AI while students observe, critique, and reflect.',
  supervised_student_ai: 'Students use teacher-approved prompts with privacy warnings and reflection checkpoints.',
  independent_student_ai: 'Students use AI individually within teacher, family, school, and platform rules.',
};

const productEdges = [
  {
    title: 'Source-grounded',
    text: 'Starts from the AI for Students curriculum map instead of a blank prompt.',
  },
  {
    title: 'Evidence-ready',
    text: 'Pushes outcomes, assessments, rubrics, and CQI artifacts into the package.',
  },
  {
    title: 'AI guardrails built in',
    text: 'Treats student AI access, privacy, and responsible-use rules as first-class settings.',
  },
  {
    title: 'Export-ready',
    text: 'Turns generated packages into HTML, print/PDF, Markdown, copy, and PPT starts.',
  },
];

const readinessChecks = [
  {
    label: 'Standards / outcomes alignment',
    terms: ['standard', 'outcome', 'objective', 'alignment', 'matrix'],
  },
  {
    label: 'Assessment evidence',
    terms: ['assessment', 'rubric', 'evidence', 'quiz'],
  },
  {
    label: 'AI-use guardrails',
    terms: ['guardrail', 'responsible ai', 'ai use', 'human judgment'],
  },
  {
    label: 'Privacy language',
    terms: ['privacy', 'private', 'personally identifiable', 'ferpa', 'coppa'],
  },
  {
    label: 'Accessibility supports',
    terms: ['differentiation', 'accessibility', 'ell', 'iep', '504', 'reading level', 'sentence frame'],
  },
  {
    label: 'Prompt library',
    terms: ['prompt library', 'prompt stem', 'prompt card', 'prompting'],
  },
  {
    label: 'Interactive AI lab',
    terms: ['interactive lab', 'lab flow', 'prompt experiment', 'scenario card', 'verification lab'],
  },
  {
    label: 'AI evaluation rubric',
    terms: ['rubric', 'accuracy', 'bias', 'evidence', 'verification'],
  },
  {
    label: 'Family / admin language',
    terms: ['family', 'guardian', 'admin', 'administrator', 'policy alignment summary'],
  },
  {
    label: 'Implementation notes',
    terms: ['checklist', 'implementation', 'materials', 'delivery'],
  },
  {
    label: 'LMS-ready instructions',
    terms: ['lms', 'canvas', 'google classroom', 'moodle', 'schoology', 'assignment post'],
  },
  {
    label: 'Student submission evidence',
    terms: ['submission', 'student evidence', 'submit', 'deliverable', 'evidence of learning'],
  },
  {
    label: 'Rubric table',
    terms: ['rubric table', 'criteria', 'performance level', 'points', 'score'],
  },
  {
    label: 'Bias / inclusivity review',
    terms: ['bias', 'inclusive', 'representation', 'stereotype', 'culturally responsive'],
  },
  {
    label: 'Data privacy transparency',
    terms: ['data privacy', 'source upload', 'deleted', 'stored', 'privacy note'],
  },
];

const policyOptions = [
  'Classroom AI Use Policy',
  'Student Responsible AI Agreement',
  'Family / Guardian AI Notice',
  'College Course AI Policy',
  'Department Review Draft',
];

const policyPresetOptions = [
  {
    value: 'strict_no_student_ai',
    label: 'Strict no-student-AI',
    description: 'Printable or teacher-led only; no student prompt entry or live AI access.',
    guardrails: ['Use teacher-prepared examples only', 'Include no-AI activity path', 'Add family/admin note'],
  },
  {
    value: 'teacher_demo_only',
    label: 'Teacher-demo only',
    description: 'Teacher projects AI examples while students critique and reflect.',
    guardrails: ['Teacher enters prompts', 'Students do not enter private data', 'Pause for verification checks'],
  },
  {
    value: 'supervised_student_ai',
    label: 'Supervised student AI',
    description: 'Students use approved prompts with monitoring, privacy warnings, and reflection.',
    guardrails: ['Use approved prompt stems', 'Require disclosure', 'Require output verification'],
  },
  {
    value: 'independent_with_disclosure',
    label: 'Independent with disclosure',
    description: 'Student AI use is allowed with citation, verification, and responsible-use rules.',
    guardrails: ['Students cite AI help', 'Teacher reviews evidence', 'Privacy rules stay visible'],
  },
  {
    value: 'higher_ed_course_policy',
    label: 'Higher-ed course policy',
    description: 'College course language for allowed/prohibited uses, academic integrity, and privacy.',
    guardrails: ['Label syllabus draft', 'Clarify academic-integrity expectations', 'Avoid claiming institutional approval'],
  },
];

const reviewStatuses: ReviewStatus[] = ['Draft', 'Needs Review', 'Faculty Review', 'Advisory Review', 'Ready to Share'];

const defaultStandardsLibrary = [
  'ISTE AI literacy: students evaluate AI outputs, use AI responsibly, protect privacy, and explain limitations.',
  'CSTA: students explain impacts of computing, analyze data, discuss algorithms, and evaluate responsible technology use.',
  'NGSS practice: students analyze data, evaluate explanations, and distinguish evidence from unsupported claims.',
  'Common Core ELA: students evaluate claims, evidence, source credibility, audience, purpose, and reasoning.',
  'Tennessee/local placeholder: map local digital readiness, computer science, or subject standards before sharing externally.',
  'AI literacy competencies: define AI, identify examples, prompt effectively, verify outputs, cite AI assistance, and reflect on ethical use.',
  'Course outcome: apply Python and data tools to analyze a small dataset and communicate findings.',
  'Program outcome: design, evaluate, and present applied AI solutions that meet ethical, privacy, and workforce expectations.',
  'CQI evidence: collect rubrics, lab artifacts, portfolio samples, advisory feedback, and student reflection data each term.',
];

const refinementPresets = [
  { label: 'Make more rigorous', instruction: 'Increase cognitive rigor with higher-order objectives, more demanding assessment evidence, and stronger success criteria.' },
  { label: 'Add hands-on labs', instruction: 'Add applied labs with materials, steps, data/tools, deliverables, troubleshooting notes, and evidence of learning.' },
  { label: 'Add beginner supports', instruction: 'Add beginner-friendly scaffolds, vocabulary support, examples, accessibility supports, and confidence-building checks.' },
  { label: 'Simplify for students', instruction: 'Rewrite student-facing directions and handouts at a simpler reading level while preserving the learning goals.' },
  { label: 'ELL-friendly', instruction: 'Add vocabulary previews, sentence frames, visual cues, partner talk, and language-accessible directions for multilingual learners.' },
  { label: 'More examples', instruction: 'Add concrete teacher and student examples, model responses, common misconceptions, and non-examples.' },
  { label: 'Extension challenge', instruction: 'Add an advanced extension task with deeper reasoning, transfer, and optional independent inquiry.' },
  { label: 'Turn into AI lab', instruction: 'Convert this package into a safe interactive AI literacy lab with teacher setup, student lab flow, sample materials, guardrails, reflection, evidence of learning, and slide outline.' },
  { label: 'Make LMS-ready', instruction: 'Convert this into a copy-ready LMS assignment package with Canvas module overview, Google Classroom assignment post, Moodle/Schoology activity instructions, discussion prompt if useful, student checklist, submission evidence, rubric table, teacher announcement, due-date placeholder, points placeholder, and AI-use policy language.' },
  { label: 'Check Bias & Inclusivity', instruction: 'Review the package for biased, exclusionary, culturally narrow, inaccessible, or stereotype-reinforcing language. Return one improved package plus a concise ## Bias and Inclusivity Notes section that names what changed.' },
  { label: 'Advisory version', instruction: 'Rewrite or extend this for advisory board review with employer-facing rationale, questions, evidence needs, and decision points.' },
  { label: 'Recruitment version', instruction: 'Create student-facing and stakeholder-facing recruitment copy, talking points, program benefits, and career relevance.' },
  { label: 'Convert to HyFlex', instruction: 'Convert the package to HyFlex delivery with in-person, online synchronous, and asynchronous options.' },
];

const aiLiteracyComponents = [
  'Understand AI',
  'Use AI responsibly',
  'Evaluate AI outputs',
  'Prompt effectively',
  'Recognize bias',
];

const readingSupportOptions = [
  {
    value: 'standard_supports',
    label: 'Standard supports',
    description: 'Clear directions, checks for understanding, and teacher facilitation notes.',
  },
  {
    value: 'simplified_student_version',
    label: 'Simplified student version',
    description: 'Shorter student-facing directions, plain language, and more modeled examples.',
  },
  {
    value: 'ell_friendly',
    label: 'ELL-friendly',
    description: 'Vocabulary preview, sentence frames, partner talk, and language-accessible directions.',
  },
  {
    value: 'extension_ready',
    label: 'Extension ready',
    description: 'Adds deeper challenge tasks for students ready for independent transfer.',
  },
];

const promptLibraryOptions = [
  {
    value: 'evaluate_ai_output',
    label: 'Evaluate an AI output',
    description: 'Students critique accuracy, missing context, bias, and verification needs.',
    prompts: [
      'What claim is the AI making, and what evidence would we need to trust it?',
      'What might be missing, oversimplified, or biased in this AI answer?',
      'How would you verify this answer without using AI as the final authority?',
    ],
  },
  {
    value: 'improve_prompt',
    label: 'Improve a prompt',
    description: 'Students compare weak and stronger prompts and explain the difference.',
    prompts: [
      'What is unclear about this prompt?',
      'What context, role, audience, or format should we add?',
      'How did the improved prompt change the usefulness of the response?',
    ],
  },
  {
    value: 'subject_connection',
    label: 'Connect AI to subject learning',
    description: 'Students use AI literacy in ELA, science, social studies, math, CTE, or advisory.',
    prompts: [
      'How could AI help us explore this topic while still requiring human judgment?',
      'What should we ask AI, and what should we answer ourselves?',
      'What source or class evidence would strengthen or challenge the AI response?',
    ],
  },
  {
    value: 'no_ai_discussion',
    label: 'No-AI discussion prompts',
    description: 'Printable prompts for classes that cannot use live AI tools.',
    prompts: [
      'Where might a person encounter AI in this situation?',
      'What could go wrong if someone trusted an AI system too quickly?',
      'What responsible-use rule would you recommend for this scenario?',
    ],
  },
];

const rubricFocusOptions = [
  {
    value: 'balanced_ai_literacy',
    label: 'Balanced AI literacy rubric',
    description: 'Accuracy, evidence, bias, privacy, prompt quality, and reflection.',
    criteria: ['Accuracy', 'Evidence and verification', 'Bias and limitations', 'Privacy and ethical use', 'Prompt quality', 'Reflection'],
  },
  {
    value: 'ai_output_evaluation',
    label: 'AI-output evaluation rubric',
    description: 'Focuses on whether students can critique AI responses responsibly.',
    criteria: ['Claim checking', 'Evidence quality', 'Missing context', 'Bias detection', 'Revision recommendations'],
  },
  {
    value: 'responsible_use',
    label: 'Responsible-use rubric',
    description: 'Focuses on privacy, citation, human judgment, and appropriate use.',
    criteria: ['Privacy protection', 'AI disclosure', 'Human verification', 'Appropriate use', 'Ethical reflection'],
  },
  {
    value: 'prompt_design',
    label: 'Prompt-design rubric',
    description: 'Focuses on clear task, context, audience, format, and iteration.',
    criteria: ['Task clarity', 'Context', 'Audience', 'Output format', 'Iteration and improvement'],
  },
];

const interactiveLabOptions = [
  {
    value: 'prompt_experimenter',
    label: 'Prompt Experimenter',
    description: 'Students compare a weak prompt, an improved prompt, response differences, and reflection.',
    steps: ['Weak prompt', 'Improve context and constraints', 'Compare responses', 'Reflect on what changed'],
  },
  {
    value: 'ai_output_evaluation_lab',
    label: 'AI Output Evaluation Lab',
    description: 'Students inspect a sample AI response for accuracy, evidence, missing context, bias, and verification steps.',
    steps: ['Read sample AI output', 'Mark claims', 'Identify missing evidence', 'Plan verification', 'Revise responsibly'],
  },
  {
    value: 'bias_fairness_scenario',
    label: 'Bias/Fairness Scenario',
    description: 'Students discuss whether an AI use is fair, risky, biased, appropriate, and how to improve it.',
    steps: ['Read scenario', 'Identify affected people', 'Name risk or bias', 'Recommend guardrails', 'Reflect'],
  },
];

const policyCheckItems = [
  'No private student information in uploads or prompts',
  'Student AI access matches school or district policy',
  'AI outputs must be verified before use',
  'Students cite or disclose AI assistance when allowed',
  'Teacher reviews materials before classroom use',
  'Family/admin language included when needed',
  'Privacy language is FERPA/COPPA-aware without claiming legal compliance',
];

const standardsSuggestionLibrary: Record<string, string[]> = {
  'AI Literacy': [
    'ISTE: students evaluate AI outputs, cite assistance, protect privacy, and explain limitations.',
    'AI literacy: define AI, identify everyday uses, recognize bias, verify outputs, and reflect on responsible use.',
    'Digital citizenship: students make ethical choices when using automated tools and online information.',
  ],
  'Computer Science': [
    'CSTA: impacts of computing, data and analysis, algorithms, and responsible technology use.',
    'AI literacy: model inputs/outputs, limitations, testing, and human oversight.',
    'Career readiness: students document technical reasoning and communicate findings.',
  ],
  ELA: [
    'Common Core ELA: evaluate claims, evidence, source credibility, audience, purpose, and reasoning.',
    'AI literacy: compare human and AI-generated explanations for accuracy, bias, and missing context.',
    'Writing: students revise prompts and responses with attention to clarity and evidence.',
  ],
  Science: [
    'Science practice: analyze data, evaluate explanations, and distinguish evidence from unsupported claims.',
    'AI literacy: inspect model limitations and discuss uncertainty, bias, and verification.',
    'Responsible use: protect privacy when using datasets or examples.',
  ],
  'Art / Media': [
    'Media arts: students analyze authorship, audience, purpose, representation, and creative choices.',
    'AI literacy: students explain how generative tools may shape ownership, attribution, and representation.',
    'Responsible use: disclose AI assistance and avoid uploading personal images without permission.',
  ],
  'Social Studies': [
    'Civic reasoning: evaluate information sources, bias, misinformation, and societal impacts of AI.',
    'AI literacy: examine how automated systems may shape decisions, access, and representation.',
    'Discussion: students support claims with evidence and consider ethical tradeoffs.',
  ],
  Math: [
    'Mathematical practice: reason quantitatively, interpret data, critique conclusions, and explain methods.',
    'AI literacy: identify patterns, limitations, and possible errors in AI-generated analysis.',
    'Data literacy: use evidence and verification before accepting a result.',
  ],
  CTE: [
    'Career readiness: use tools responsibly, document workflow, verify outputs, and communicate decisions.',
    'AI literacy: match AI use to workplace policy, privacy expectations, and human oversight.',
    'Applied learning: students create evidence of skill through authentic tasks.',
  ],
  Advisory: [
    'Digital citizenship: privacy, identity protection, disclosure, respectful use, and human judgment.',
    'AI literacy: recognize AI in daily life and decide when use is appropriate.',
    'Reflection: students explain responsible choices and verification habits.',
  ],
  'Career Readiness': [
    'Employability skills: communication, ethical technology use, evidence-based decisions, and self-management.',
    'AI literacy: prompt effectively, verify results, cite assistance, and protect sensitive information.',
    'Portfolio readiness: students document process, choices, and learning evidence.',
  ],
};

const deliverableDescriptions: Record<string, string> = {
  quick_class_activity: 'Fast classroom-ready activity with a student handout and exit ticket.',
  full_lesson_pack: 'Complete teacher plan, student handout, guided AI activity, checks, rubric, and implementation notes.',
  admin_ready_sample: 'Review-friendly sample with standards alignment, admin/family summary, and rubric evidence.',
  no_ai_classroom_version: 'Printable lesson path using examples and discussion instead of live student AI access.',
  mini_unit: 'Multi-day sequence with daily activities, assessments, reflection, and pacing.',
  prompt_experiment_activity: 'Structured activity where students tune prompts and compare response quality.',
  ai_output_evaluation_lab: 'Hands-on lab for checking claims, evidence, bias, hallucination risk, and verification steps.',
  bias_fairness_scenario: 'Scenario discussion package for AI fairness, representation, risk, and responsible decisions.',
  lms_assignment_pack: 'Copy-ready LMS package with module overview, assignment post, student checklist, rubric table, and announcement.',
  syllabus_draft: 'Course overview, outcomes, policies, schedule, and grading language.',
  full_course_package: 'Full syllabus-ready course with modules, labs, assignments, assessment plan, and AI policy.',
  lab_ready_course: 'Hands-on course build with lab objectives, setup notes, checkpoints, rubrics, and troubleshooting.',
  online_hyflex_course: 'Course package adapted for online, asynchronous, synchronous, and HyFlex delivery.',
  program_coordinator_packet: 'Course-to-program alignment, CQI evidence, advisory questions, and workforce narrative.',
};

const interactiveDeliverableOptions: OptionItem[] = [
  {
    value: 'prompt_experiment_activity',
    label: 'Prompt Experiment Activity',
    deliverables: ['teacher_plan', 'prompt_cards', 'student_handout', 'reflection', 'rubric_checklist'],
  },
  {
    value: 'ai_output_evaluation_lab',
    label: 'AI Output Evaluation Lab',
    deliverables: ['sample_ai_output', 'claim_checking', 'verification_steps', 'student_handout', 'rubric_checklist'],
  },
  {
    value: 'bias_fairness_scenario',
    label: 'Bias/Fairness Scenario',
    deliverables: ['scenario_cards', 'discussion_questions', 'guardrail_recommendations', 'reflection', 'rubric_checklist'],
  },
  {
    value: 'lms_assignment_pack',
    label: 'LMS Assignment Pack',
    deliverables: ['canvas_module_overview', 'google_classroom_post', 'student_checklist', 'submission_evidence', 'rubric_table'],
  },
];

const curriculumQuickStarts = [
  {
    title: '10th Grade AI Mini-Unit',
    description: 'A five-day sequence for AI basics, verification, prompting, and responsible use.',
    settings: {
      gradeLevel: '10',
      readingLevel: 'Grade 10',
      subjectContext: 'AI Literacy',
      standardsTarget: 'ISTE',
      timeAvailable: '5-day unit',
      classFormat: 'Whole class',
      studentAiAccessLevel: 'teacher_demo_ai',
      packPreset: 'mini_unit',
      readingSupport: 'standard_supports',
      promptLibraryPreset: 'evaluate_ai_output',
      rubricFocus: 'balanced_ai_literacy',
      interactiveLab: 'ai_output_evaluation_lab',
      policyCheck: 'teacher_demo_only',
      policyOutput: 'Classroom AI Use Policy',
    },
  },
  {
    title: 'Responsible AI Lesson',
    description: 'A single-period lesson focused on privacy, verification, citation, and AI limits.',
    settings: {
      gradeLevel: '9',
      readingLevel: 'Grade 9',
      subjectContext: 'Advisory',
      standardsTarget: 'ISTE',
      timeAvailable: '45 min',
      classFormat: 'Whole class',
      studentAiAccessLevel: 'teacher_demo_ai',
      packPreset: 'full_lesson_pack',
      readingSupport: 'ell_friendly',
      promptLibraryPreset: 'no_ai_discussion',
      rubricFocus: 'responsible_use',
      interactiveLab: 'bias_fairness_scenario',
      policyCheck: 'teacher_demo_only',
      policyOutput: 'Student Responsible AI Agreement',
    },
  },
  {
    title: 'No-Student-AI Version',
    description: 'Printable and discussion-based materials for schools that restrict student AI access.',
    settings: {
      gradeLevel: '8',
      readingLevel: 'Grade 8',
      subjectContext: 'AI Literacy',
      standardsTarget: 'ISTE',
      timeAvailable: '60 min',
      classFormat: 'Small group',
      studentAiAccessLevel: 'no_student_ai',
      packPreset: 'no_ai_classroom_version',
      readingSupport: 'simplified_student_version',
      promptLibraryPreset: 'no_ai_discussion',
      rubricFocus: 'responsible_use',
      interactiveLab: 'bias_fairness_scenario',
      policyCheck: 'strict_no_student_ai',
      policyOutput: 'Family / Guardian AI Notice',
    },
  },
];

const samplePackages: Array<{ title: string; mode: BuilderMode; description: string; content: string }> = [
  {
    title: 'AI Literacy Lesson Pack',
    mode: 'curriculum-pack',
    description: 'Single lesson with guardrails, activity, assessment, and slide outline.',
    content: '## Lesson Snapshot\nGrade 10 AI literacy lesson on evaluating AI answers.\n\n## Standards / Outcomes Alignment Matrix\nOutcome alignment matrix connects objectives, activity, assessment evidence, and reflection.\n\n## AI Use Guardrails\nProtect privacy, verify outputs, cite AI help, and do not submit AI text as final work.\n\n## Slide Deck Outline\nSix slides with teacher notes and student interaction moments.\n\n## Teacher Implementation Checklist\nMaterials, timing, accessibility supports, and exit ticket are ready for review.',
  },
  {
    title: '5-Day AI Mini-Unit',
    mode: 'curriculum-pack',
    description: 'Week-long AI literacy sequence for classroom rollout.',
    content: '## Lesson Snapshot\nFive-day mini-unit on AI basics, prompting, verification, subject use, and responsible choices.\n\n## Assessment Evidence\nDaily exit tickets, student reflection, rubric, and final responsible-use scenario.\n\n## Differentiation and Accessibility\nBeginner vocabulary, examples, sentence frames, and extension challenges.\n\n## Slide Deck Outline\nDaily opener, guided demo, student practice, reflection, and wrap-up slides.\n\n## Teacher Implementation Checklist\nPrintables, demo prompts, no-AI alternative, and family/admin note.',
  },
  {
    title: 'Responsible AI Lesson',
    mode: 'curriculum-pack',
    description: 'Privacy, disclosure, verification, and human judgment lesson for cautious rollouts.',
    content: '## Lesson Snapshot\nResponsible AI lesson focused on privacy, human judgment, disclosure, and verification.\n\n## Standards / Outcomes Alignment Matrix\nAI literacy and digital citizenship outcomes map to discussion, scenario analysis, reflection, and exit-ticket evidence.\n\n## Policy Alignment Summary\nNo private student information, teacher-reviewed AI examples, student disclosure language, family/admin note, and FERPA/COPPA-aware privacy reminders without legal-compliance claims.\n\n## Prompt Library\nNo-AI discussion prompts and teacher-demo prompt stems help students critique AI use without independent access.\n\n## AI Evaluation Rubric\nCriteria include privacy protection, human verification, appropriate use, disclosure, and ethical reflection.',
  },
  {
    title: 'AI-Output Evaluation Activity',
    mode: 'curriculum-pack',
    description: 'Student activity for checking accuracy, evidence, bias, and missing context.',
    content: '## Lesson Snapshot\nStudents evaluate a sample AI response for accuracy, evidence, missing context, bias, and responsible revision.\n\n## Student Activity\nStudents annotate claims, mark what needs verification, identify possible bias, and rewrite the response with stronger evidence.\n\n## Prompt Library\nPrompt stems ask students what claim the AI is making, what evidence is needed, and how they would verify the result.\n\n## AI Evaluation Rubric\nFour-level rubric assesses claim checking, evidence quality, missing context, bias detection, and revision recommendations.\n\n## Differentiation and Accessibility\nIncludes sentence frames, vocabulary support, partner discussion, and extension challenge.',
  },
  {
    title: 'No-Student-AI Classroom Version',
    mode: 'curriculum-pack',
    description: 'Printable AI literacy lesson for schools where students cannot use AI tools.',
    content: '## Lesson Snapshot\nNo-student-AI lesson using teacher-provided examples, discussion scenarios, printable handouts, and exit-ticket reflection.\n\n## AI Use Guardrails\nStudents do not enter prompts or data into AI tools. Teacher uses prepared examples only. No private student information is used.\n\n## Policy Alignment Summary\nDesigned for restrictive policies with teacher review, family/admin language, AI disclosure notes, and privacy reminders.\n\n## Student Activity\nStudents compare possible AI uses, identify risks, and recommend responsible-use rules.\n\n## Teacher Implementation Checklist\nPrint examples, review policy language, prepare discussion norms, and collect exit-ticket evidence.',
  },
  {
    title: 'ELA Source Evaluation with AI',
    mode: 'curriculum-pack',
    description: 'Cross-curricular ELA lesson on claims, evidence, source credibility, and AI verification.',
    content: '## Lesson Snapshot\nELA lesson where students compare a sample AI explanation with classroom sources and decide which claims need evidence.\n\n## Standards / Outcomes Alignment Matrix\nCommon Core ELA claim/evidence analysis maps to AI literacy outcomes for verification, bias detection, and responsible citation.\n\n## Prompt Library\nStudents ask what claim is being made, what source evidence supports it, and what context is missing.\n\n## AI Evaluation Rubric\nCriteria include accuracy, source evidence, reasoning, bias and limitations, and revision quality.\n\n## Bias and Inclusivity Notes\nTeacher reviews examples for representation, assumptions, and accessible language before use.',
  },
  {
    title: 'Social Studies AI Misinformation',
    mode: 'curriculum-pack',
    description: 'Cross-curricular civic reasoning lesson on AI, misinformation, bias, and elections/media.',
    content: '## Lesson Snapshot\nSocial studies lesson where students analyze an AI-generated civic claim, identify misinformation risks, and practice evidence-based verification.\n\n## Standards / Outcomes Alignment Matrix\nCivic reasoning and media literacy outcomes align to AI literacy skills: verify outputs, recognize bias, and explain human judgment.\n\n## Student Activity\nStudents annotate a claim, identify who might be affected, list sources to check, and write a responsible-use recommendation.\n\n## Policy Alignment Summary\nUses teacher-prepared examples, no private student information, and clear AI disclosure language.\n\n## Teacher Implementation Checklist\nPrepare neutral examples, review discussion norms, provide source list, and collect reflection evidence.',
  },
  {
    title: 'Art and Media AI Ownership',
    mode: 'curriculum-pack',
    description: 'Cross-curricular creative AI lesson on authorship, ownership, attribution, and ethics.',
    content: '## Lesson Snapshot\nArt/media lesson where students evaluate generative AI use through creativity, attribution, representation, and ownership questions.\n\n## Student Activity\nStudents compare human-created and AI-assisted media scenarios, discuss attribution, and create responsible-use guidelines.\n\n## AI Use Guardrails\nProtect privacy, avoid uploading personal images without permission, disclose AI assistance, and verify tool rules.\n\n## AI Evaluation Rubric\nCriteria include ethical use, attribution, representation, creative intent, and reflection.\n\n## Family / Admin Note\nExplains how AI is discussed as a literacy and ethics topic rather than a replacement for student creativity.',
  },
  {
    title: 'Prompt Tuning Lab',
    mode: 'curriculum-pack',
    description: 'Interactive prompt experiment where students improve prompts and compare response quality.',
    content: '## Lab Snapshot\nStudents compare a weak prompt with an improved prompt, predict how the response should change, and reflect on what made the prompt more useful.\n\n## Interactive Lab Flow\n1. Read the weak prompt.\n2. Add context, audience, constraints, and output format.\n3. Compare response quality using teacher-provided examples or supervised AI access.\n4. Revise once more and explain the improvement.\n\n## AI Use Guardrails\nNo private information, teacher-approved prompts only, verify outputs, and cite AI assistance when allowed.\n\n## Student Handout\nIncludes prompt revision table, response comparison chart, and reflection questions.\n\n## Rubric\nCriteria include task clarity, context, output format, response evaluation, and reflection.',
  },
  {
    title: 'AI Hallucination Check',
    mode: 'curriculum-pack',
    description: 'AI output evaluation lab for claims, evidence, missing context, and verification.',
    content: '## Lab Snapshot\nStudents inspect a sample AI response, mark claims that need evidence, identify possible hallucination risks, and plan verification steps.\n\n## Interactive Lab Flow\n1. Read the AI response.\n2. Highlight claims and unsupported details.\n3. Sort each claim as reliable, uncertain, or needs verification.\n4. Choose sources or class evidence to check.\n5. Rewrite the response responsibly.\n\n## AI Use Guardrails\nAI is not the final authority. Students verify with trusted sources and do not enter private personal information.\n\n## Rubric\nCriteria include claim checking, evidence quality, missing context, bias detection, verification plan, and revision recommendations.',
  },
  {
    title: 'Bias in AI Scenario Discussion',
    mode: 'curriculum-pack',
    description: 'Scenario-based lab for fairness, representation, risk, and responsible guardrails.',
    content: '## Lab Snapshot\nStudents evaluate an AI-use scenario for fairness, bias, representation, privacy, and possible harm.\n\n## Interactive Lab Flow\n1. Read the scenario card.\n2. Identify who is affected by the AI decision or output.\n3. Name possible bias, missing perspectives, or privacy risks.\n4. Recommend guardrails or a better decision process.\n5. Reflect on how human judgment should stay involved.\n\n## Bias and Inclusivity Notes\nTeacher reviews scenarios for cultural assumptions, representation, and accessible language before use.\n\n## Rubric\nCriteria include fairness reasoning, risk identification, representation, privacy, guardrail quality, and reflection.',
  },
  {
    title: 'Canvas-Ready AI Output Assignment',
    mode: 'curriculum-pack',
    description: 'LMS-ready assignment block for an AI output evaluation activity.',
    content: '## LMS Assignment Pack\n\n## Canvas Module Overview\nStudents evaluate a sample AI response for accuracy, evidence, missing context, bias, and verification needs.\n\n## Google Classroom Assignment Post\nTitle: AI Output Evaluation Lab\nInstructions: Read the sample AI response, mark claims that need evidence, identify possible bias or missing context, and submit your verification plan and revised response.\n\n## Student Checklist\n- Identify at least three claims.\n- Mark what needs verification.\n- Name one possible bias or limitation.\n- Choose sources or class evidence to check.\n- Submit a revised response and reflection.\n\n## Submission Evidence\nStudents submit an annotated response, verification notes, revised response, and reflection.\n\n## Rubric Table\nCriteria: claim checking, evidence quality, bias detection, verification plan, revision quality, responsible AI use.',
  },
  {
    title: 'Google Classroom Prompt Experiment Post',
    mode: 'curriculum-pack',
    description: 'Copy-ready assignment post for prompt tuning and reflection.',
    content: '## LMS Assignment Pack\n\n## Google Classroom Assignment Post\nTitle: Prompt Experiment: Improve the Prompt\nInstructions: Compare a weak prompt with an improved prompt. Explain what changed, predict how the response will improve, and reflect on how prompt clarity affects AI output quality.\n\n## Student Directions\n1. Read the weak prompt.\n2. Add context, audience, constraints, and output format.\n3. Compare the two responses provided by your teacher or generated under supervision.\n4. Submit your improved prompt and reflection.\n\n## Student Checklist\nPrompt has a clear task, context, audience, format, and privacy-safe wording.\n\n## Submission Evidence\nImproved prompt, comparison notes, and reflection paragraph.\n\n## Rubric Table\nCriteria: task clarity, context, output format, comparison quality, reflection.',
  },
  {
    title: 'LMS Discussion: Bias/Fairness Scenario',
    mode: 'curriculum-pack',
    description: 'Discussion-board ready AI fairness scenario with rubric and response checklist.',
    content: '## LMS Assignment Pack\n\n## LMS Discussion Prompt\nRead the AI fairness scenario. Who could be affected by the AI output or decision? What bias, privacy issue, or missing perspective might appear? What guardrails would make the use safer or fairer?\n\n## Student Response Requirements\nPost one original response and one reply. Use evidence from the scenario. Recommend at least one practical guardrail.\n\n## Student Checklist\n- Names affected people or groups.\n- Identifies one fairness, bias, or privacy concern.\n- Recommends a guardrail.\n- Explains where human judgment belongs.\n\n## Submission Evidence\nDiscussion post, peer reply, and short reflection.\n\n## Rubric Table\nCriteria: fairness reasoning, risk identification, guardrail quality, peer response, reflection.',
  },
  {
    title: 'Intro AI Technology Course',
    mode: 'college-course',
    description: 'Course package with weekly modules, labs, policy, and CQI plan.',
    content: '## Course Snapshot\nIntroduction to Artificial Intelligence Technology, 3 credits, hybrid.\n\n## Outcomes-to-Assessments Matrix\nOutcomes map to weekly modules, Python labs, portfolio evidence, and assessments.\n\n## Labs\nWeekly applied labs using Python, datasets, generative AI tools, and ethics cases.\n\n## Responsible AI Policy\nFERPA/privacy cautions, citation expectations, and allowed/prohibited uses.\n\n## CQI Evidence Plan\nRubrics, lab artifacts, student performance, and advisory feedback reviewed each term.',
  },
  {
    title: 'AI Certificate Pathway',
    mode: 'college-program',
    description: 'Stackable certificate pathway with program outcomes and course sequence.',
    content: '## Program Snapshot\nStackable Artificial Intelligence Technology certificate to AAS pathway.\n\n## Credential Pathways\nShort-term certificate, advanced certificate, and associate degree milestones.\n\n## Outcomes-to-Courses Curriculum Map\nProgram outcomes map to courses, labs, portfolio artifacts, and CQI evidence.\n\n## Advisory Board Agenda\nEmployer skill validation, internship targets, tool relevance, and curriculum feedback.\n\n## Recruitment Copy\nCareer-ready AI skills for local workforce needs.',
  },
  {
    title: 'Advisory Board Agenda Package',
    mode: 'college-program',
    description: 'Employer-facing agenda, questions, and curriculum feedback plan.',
    content: '## Program Snapshot\nAI Technology advisory board review package.\n\n## Advisory Board Agenda\nWelcome, labor market context, course sequence review, skill validation, project feedback, and next steps.\n\n## Employer / Internship Partnership Targets\nApplied data, automation, AI operations, and portfolio project partners.\n\n## Assessment and CQI Plan\nAdvisory feedback updates outcomes, labs, tools, and recruitment strategy.\n\n## Department Review Checklist\nDraft items ready for faculty, chair, and advisory review.',
  },
];

function App() {
  const [activeMode, setActiveMode] = useState<BuilderMode>('curriculum-pack');
  const [debugOpen, setDebugOpen] = useState(false);
  const [fontScale, setFontScale] = useState<FontScale>('standard');
  const [highContrast, setHighContrast] = useState(false);
  const [loadedPackageContent, setLoadedPackageContent] = useState('');
  const [savedPackages, setSavedPackages] = useState<SavedPackage[]>(() => loadSavedPackages());
  const { messages, isLoading, error, debugInfo, sendMessage, clearChat } = useChat();

  const handleBuild = (prompt: string, config: ClassroomConfig) => {
    setLoadedPackageContent('');
    clearChat();
    void sendMessage(prompt, 'teacher', config);
  };

  const handleImprove = (prompt: string) => {
    void sendMessage(prompt, 'teacher', { ...baseConfig, outputDepth: 'Detailed' });
  };

  const latestAssistantMessage = [...messages].reverse().find((message) => message.role === 'assistant');
  const generatedContent = latestAssistantMessage?.content ?? loadedPackageContent;

  useEffect(() => {
    saveSavedPackages(savedPackages);
  }, [savedPackages]);

  const saveCurrentPackage = (content: string, status: ReviewStatus) => {
    const nextPackage: SavedPackage = {
      id: crypto.randomUUID(),
      title: inferPackageTitle(content, activeMode),
      mode: activeMode,
      content,
      status,
      createdAt: Date.now(),
    };
    setSavedPackages((current) => [nextPackage, ...current].slice(0, 24));
  };

  const loadPackage = (savedPackage: SavedPackage) => {
    setActiveMode(savedPackage.mode);
    setLoadedPackageContent(savedPackage.content);
    clearChat();
  };

  const deletePackage = (id: string) => {
    setSavedPackages((current) => current.filter((savedPackage) => savedPackage.id !== id));
  };

  const loadSample = (sample: (typeof samplePackages)[number]) => {
    setActiveMode(sample.mode);
    setLoadedPackageContent(sample.content);
    clearChat();
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 ${fontScale === 'large' ? 'text-[17px]' : fontScale === 'extra-large' ? 'text-[18px]' : ''} ${highContrast ? 'contrast-125 saturate-150' : ''}`}>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-700 text-white">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">Classroom Copilot</h1>
              <p className="text-sm text-slate-600">AI curriculum and program builder</p>
            </div>
          </div>

          <nav className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1" aria-label="Builder modes">
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setActiveMode(mode.id)}
                  className={`flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition ${
                    activeMode === mode.id ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {mode.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <ProductEdgeStrip />
        <AccessibilityControls
          fontScale={fontScale}
          onFontScaleChange={setFontScale}
          highContrast={highContrast}
          onHighContrastChange={setHighContrast}
        />
        <StartFromGallery activeMode={activeMode} onLoadSample={loadSample} />

        {activeMode === 'curriculum-pack' ? (
          <CurriculumPackBuilder isLoading={isLoading} onBuild={handleBuild} />
        ) : activeMode === 'college-course' ? (
          <CollegeCourseBuilder isLoading={isLoading} onBuild={handleBuild} />
        ) : (
          <CollegeProgramBuilder isLoading={isLoading} onBuild={handleBuild} />
        )}

        <GeneratedOutput
          isLoading={isLoading}
          content={generatedContent}
          activeMode={activeMode}
          emptyTitle={activeMode === 'curriculum-pack' ? 'Your curriculum pack will appear here' : activeMode === 'college-course' ? 'Your course package will appear here' : 'Your program package will appear here'}
          onImprove={handleImprove}
          onSave={saveCurrentPackage}
          savedPackages={savedPackages}
          onLoadPackage={loadPackage}
          onDeletePackage={deletePackage}
        />
      </main>

      {debugInfo && (
        <div className="fixed bottom-20 right-4 z-40 max-w-[calc(100vw-2rem)] rounded-lg border border-slate-200 bg-white shadow-lg sm:max-w-md">
          <button
            type="button"
            onClick={() => setDebugOpen((prev) => !prev)}
            className="w-full border-b border-slate-100 px-4 py-2 text-left text-xs font-semibold text-slate-700"
          >
            {debugInfo.ok ? 'AI build succeeded' : 'AI build issue'} ({debugInfo.status}) {debugOpen ? 'Hide details' : 'Show details'}
          </button>
          {debugOpen && (
            <div className="space-y-1 px-4 py-3 text-xs text-slate-700">
              <p><span className="font-semibold">Endpoint:</span> {debugInfo.endpoint}</p>
              <p><span className="font-semibold">Message:</span> {debugInfo.message}</p>
              {debugInfo.functionVersion && <p><span className="font-semibold">Function:</span> {debugInfo.functionVersion}</p>}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-red-600 px-6 py-3 text-sm text-white shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}

function CurriculumPackBuilder({
  isLoading,
  onBuild,
}: {
  isLoading: boolean;
  onBuild: (prompt: string, config: ClassroomConfig) => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [unitId, setUnitId] = useState(curriculumData.units[0].id);
  const selectedUnit = useMemo(
    () => curriculumData.units.find((unit) => unit.id === unitId) ?? curriculumData.units[0],
    [unitId],
  );
  const [moduleId, setModuleId] = useState(selectedUnit.modules[0].id);
  const selectedModule = useMemo(
    () => selectedUnit.modules.find((module) => module.id === moduleId) ?? selectedUnit.modules[0],
    [selectedUnit, moduleId],
  );

  const [settings, setSettings] = useState({
    gradeLevel: '10',
    readingLevel: 'Grade 10',
    subjectContext: 'AI Literacy',
    standardsTarget: 'ISTE',
    timeAvailable: '60 min',
    classFormat: 'Whole class',
    studentAiAccessLevel: 'teacher_demo_ai',
    packPreset: 'full_lesson_pack',
    readingSupport: 'standard_supports',
    promptLibraryPreset: 'evaluate_ai_output',
    rubricFocus: 'balanced_ai_literacy',
    interactiveLab: 'ai_output_evaluation_lab',
    policyCheck: 'teacher_demo_only',
    policyOutput: 'Classroom AI Use Policy',
  });
  const [sourceNotes, setSourceNotes] = useState('');

  const packOptions = [
    ...(getFieldOptions(curriculumWorkflow, 'deliverables', 'packPreset') as OptionItem[]),
    ...interactiveDeliverableOptions,
  ];
  const studentAccessOptions = getFieldOptions(curriculumWorkflow, 'student-ai-access', 'studentAiAccessLevel') as OptionItem[];
  const selectedPack = packOptions.find((option) => option.value === settings.packPreset) ?? packOptions[1];
  const selectedAccess = studentAccessOptions.find((option) => option.value === settings.studentAiAccessLevel);
  const selectedReadingSupport = readingSupportOptions.find((option) => option.value === settings.readingSupport) ?? readingSupportOptions[0];
  const selectedPromptLibrary = promptLibraryOptions.find((option) => option.value === settings.promptLibraryPreset) ?? promptLibraryOptions[0];
  const selectedRubricFocus = rubricFocusOptions.find((option) => option.value === settings.rubricFocus) ?? rubricFocusOptions[0];
  const selectedInteractiveLab = interactiveLabOptions.find((option) => option.value === settings.interactiveLab) ?? interactiveLabOptions[1];
  const selectedPolicyPreset = policyPresetOptions.find((option) => option.value === settings.policyCheck) ?? policyPresetOptions[1];
  const standardsSuggestions = getStandardsSuggestions(settings.subjectContext, settings.standardsTarget, settings.gradeLevel);

  const updateSetting = (key: keyof typeof settings, value: string) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const applyQuickStart = (quickStart: (typeof curriculumQuickStarts)[number]) => {
    setSettings(quickStart.settings);
    setActiveStep(1);
  };

  const buildPrompt = () => {
    const config: ClassroomConfig = {
      ...baseConfig,
      grades: settings.gradeLevel,
      subjects: settings.subjectContext,
      standards: { type: normalizeStandards(settings.standardsTarget) },
      readingLevel: Number(settings.gradeLevel) || 10,
      outputDepth: 'Detailed',
    };

    const prompt = [
      'Build a complete AI literacy curriculum pack from the AI for Students curriculum map.',
      '',
      `Unit: ${selectedUnit.title}`,
      `Module: Chapter ${selectedModule.chapter} - ${selectedModule.title}`,
      `Source page: ${selectedModule.startPage}`,
      `Essential question: ${selectedModule.essentialQuestion}`,
      `Objectives: ${selectedModule.objectives.join('; ')}`,
      `Vocabulary: ${selectedModule.vocabulary.join(', ')}`,
      `Core activity seed: ${selectedModule.activity}`,
      `Assessment seed: ${selectedModule.assessment}`,
      `AI-use guardrails: ${selectedModule.guardrails.join('; ')}`,
      '',
      `Grade level: ${settings.gradeLevel}`,
      `Reading level: ${settings.readingLevel}`,
      `Subject/context: ${settings.subjectContext}`,
      `Standards target: ${settings.standardsTarget}`,
      `Suggested standards/outcomes to align: ${standardsSuggestions.join(' | ')}`,
      `Time available: ${settings.timeAvailable}`,
      `Class format: ${settings.classFormat}`,
      `Student AI access level: ${labelFromValue(settings.studentAiAccessLevel)} - ${studentAccessNotes[settings.studentAiAccessLevel]}`,
      `Output package: ${selectedPack.label}`,
      `Included deliverables: ${(selectedPack.deliverables ?? []).map(labelFromValue).join(', ')}`,
      selectedPack.value === 'lms_assignment_pack'
        ? 'LMS assignment pack requested: include Canvas module overview, Google Classroom assignment post, Moodle/Schoology activity instructions, discussion prompt if relevant, student checklist, submission evidence, rubric table, teacher announcement, AI-use policy, and due-date placeholder.'
        : 'LMS assignment pack requested: no, but include copy-ready LMS notes when useful.',
      `AI literacy components to emphasize: ${aiLiteracyComponents.join(', ')}`,
      `Reading/accessibility support: ${selectedReadingSupport.label} - ${selectedReadingSupport.description}`,
      `Prompt library focus: ${selectedPromptLibrary.label} - ${selectedPromptLibrary.description}`,
      `Prompt examples to include or adapt: ${selectedPromptLibrary.prompts.join(' | ')}`,
      `Rubric focus: ${selectedRubricFocus.label} - ${selectedRubricFocus.description}`,
      `Rubric criteria to include: ${selectedRubricFocus.criteria.join(', ')}`,
      `Interactive lab focus: ${selectedInteractiveLab.label} - ${selectedInteractiveLab.description}`,
      `Interactive lab flow: ${selectedInteractiveLab.steps.join(' -> ')}`,
      `Policy preset: ${selectedPolicyPreset.label} - ${selectedPolicyPreset.description}`,
      `Policy preset guardrails: ${selectedPolicyPreset.guardrails.join('; ')}`,
      `Policy/privacy checklist to include: ${policyCheckItems.join('; ')}`,
      `Requested policy artifact: ${settings.policyOutput}`,
      sourceNotes.trim() ? `Additional source/context notes from educator: ${sourceNotes.trim()}` : 'Additional source/context notes from educator: none provided.',
      '',
      'Return a teacher-ready package with these headings: ## Lesson Snapshot, ## Standards / Outcomes Alignment Matrix, ## Lesson Plan, ## Student Activity, ## Worksheet, ## Quiz, ## Rubric, ## AI Use Guardrails, ## Differentiation and Accessibility, ## Slide Deck Outline, ## Family / Admin Note, ## Teacher Implementation Checklist.',
      'For the alignment matrix, map objectives to activities, assessments, and evidence of learning.',
      'Use the suggested standards/outcomes where relevant, but label them as draft alignment suggestions for educator review.',
      'For the prompt library, include teacher-facing setup notes and student-facing prompt stems that match the selected AI access level.',
      'For the rubric, include four clear performance levels and the selected AI-output evaluation criteria.',
      'For the interactive lab, include teacher setup, student-facing directions, lab steps, reflection prompts, safety guardrails, evidence of learning, and a slide outline. Treat it as a safe simulated or teacher-controlled AI literacy experience unless student AI access explicitly allows independent use.',
      'For LMS-ready blocks, include copy-ready headings: ## Canvas Module Overview, ## Google Classroom Assignment Post, ## Moodle / Schoology Activity Instructions, ## Student Checklist, ## Submission Evidence, ## Rubric Table, ## Teacher Announcement. Include title, student directions, estimated time, materials, submission type, due-date placeholder, and AI-use policy language.',
      'For accessibility, include the selected reading/accessibility support as concrete student-facing adjustments.',
      'For policy compliance, include a short Policy Alignment Summary covering privacy, AI disclosure, student access, teacher review, and family/admin language.',
      'For the slide deck outline, include 6-10 slide titles with speaker notes and student interaction moments.',
      `Include the requested policy artifact as a clearly labeled subsection: ${settings.policyOutput}.`,
      'Include a no-AI or teacher-demo alternative when appropriate, student-facing directions, differentiation, and responsible AI guardrails.',
      'Keep the package practical enough to export directly into HTML, PDF, Markdown, or PPT after teacher review.',
    ].join('\n');

    onBuild(prompt, config);
  };

  const steps = [
    {
      title: 'Start',
      description: 'Choose the source module or start from a teacher-ready high school template.',
      complete: Boolean(selectedUnit && selectedModule),
      content: (
        <Panel title="Choose Curriculum Source" icon={LibraryBig}>
          <GuidanceNote>
            Pick a quick start when you want the fastest teacher path, or choose a specific unit and module from the AI for Students curriculum map.
          </GuidanceNote>
          <QuickStartGrid quickStarts={curriculumQuickStarts} onApply={applyQuickStart} />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Unit"
              value={unitId}
              onChange={(value) => {
                const nextUnit = curriculumData.units.find((unit) => unit.id === value);
                setUnitId(value);
                setModuleId(nextUnit?.modules[0]?.id ?? '');
              }}
              options={curriculumData.units.map((unit) => ({ value: unit.id, label: unit.title }))}
              help="This anchors the package in the book instead of a blank AI prompt."
            />
            <SelectField
              label="Module"
              value={selectedModule.id}
              onChange={setModuleId}
              options={selectedUnit.modules.map((module) => ({ value: module.id, label: `${module.chapter}. ${module.title}` }))}
              help="Modules become the lesson topic, objectives, vocabulary, activity seed, and assessment seed."
            />
          </div>
          <ModulePreview module={selectedModule} />
        </Panel>
      ),
    },
    {
      title: 'Context',
      description: 'Set the grade, subject, standards, time, and format.',
      complete: Boolean(settings.gradeLevel && settings.subjectContext && settings.timeAvailable),
      content: (
        <Panel title="Set Classroom Context" icon={SlidersHorizontal}>
          <GuidanceNote>
            The simple high-school path only needs grade, subject, time, and AI access. Standards and reading level can stay on the defaults unless the school requires something specific.
          </GuidanceNote>
          <FieldGrid>
            <SelectField label="Grade" value={settings.gradeLevel} onChange={(value) => updateSetting('gradeLevel', value)} options={toSelectOptions(['6', '7', '8', '9', '10', '11', '12', 'College intro'])} help="Used to tune examples, independence, guardrails, and reading level." />
            <SelectField label="Reading" value={settings.readingLevel} onChange={(value) => updateSetting('readingLevel', value)} options={toSelectOptions(['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'])} help="Student-facing instructions and handouts should match this level." />
            <SelectField label="Reading support" value={settings.readingSupport} onChange={(value) => updateSetting('readingSupport', value)} options={readingSupportOptions} help="Adds a simplified, ELL-friendly, standard, or extension-ready student version." />
            <SelectField label="Subject" value={settings.subjectContext} onChange={(value) => updateSetting('subjectContext', value)} options={toSelectOptions(['AI Literacy', 'ELA', 'Math', 'Science', 'Social Studies', 'Art / Media', 'CTE', 'Computer Science', 'Advisory', 'Career Readiness'])} help="Use this when AI literacy is being taught inside another course." />
            <SelectField label="Standards" value={settings.standardsTarget} onChange={(value) => updateSetting('standardsTarget', value)} options={toSelectOptions(['None', 'ISTE', 'CSTA', 'NGSS', 'Common Core ELA', 'Tennessee', 'Missouri', 'Kansas', 'State standards'])} help="Choose the review target that should appear in the alignment matrix." />
            <SelectField label="Time" value={settings.timeAvailable} onChange={(value) => updateSetting('timeAvailable', value)} options={toSelectOptions(['30 min', '45 min', '60 min', '90 min', '3-day mini-unit', '5-day unit'])} help="Controls pacing, activity depth, and assessment scope." />
            <SelectField label="Format" value={settings.classFormat} onChange={(value) => updateSetting('classFormat', value)} options={toSelectOptions(['Whole class', 'Small group', 'Individual', 'Station rotation', 'Online/asynchronous'])} help="Shapes directions, facilitation notes, and participation structures." />
          </FieldGrid>
          <div className="mt-5">
            <LiteracyComponentStrip />
          </div>
          <StandardsAlignmentPreview
            subject={settings.subjectContext}
            standardsTarget={settings.standardsTarget}
            suggestions={standardsSuggestions}
          />
        </Panel>
      ),
    },
    {
      title: 'AI Access',
      description: 'Choose how students may interact with AI.',
      complete: Boolean(settings.studentAiAccessLevel),
      content: (
        <Panel title="Set Student AI Access" icon={Sparkles}>
          <GuidanceNote>
            This is the core safety decision. The generated lesson will match the selected access level and include the right privacy, citation, and verification guardrails.
          </GuidanceNote>
          <SegmentedOptions value={settings.studentAiAccessLevel} onChange={(value) => updateSetting('studentAiAccessLevel', value)} options={studentAccessOptions} />
          <p className="mt-3 text-sm text-slate-600">{studentAccessNotes[settings.studentAiAccessLevel]}</p>
          <PolicyCheckPanel value={settings.policyCheck} onChange={(value) => updateSetting('policyCheck', value)} />
        </Panel>
      ),
    },
    {
      title: 'Deliverables',
      description: 'Pick the package type and included materials.',
      complete: Boolean(settings.packPreset),
      content: (
        <Panel title="Choose Deliverables" icon={ClipboardList}>
          <GuidanceNote>
            Start with Full Lesson Pack for most classrooms. Mini-Unit is best when you want multiple days, and No-AI Version is best for restrictive school policies.
          </GuidanceNote>
          <CardOptions value={settings.packPreset} onChange={(value) => updateSetting('packPreset', value)} options={packOptions} detailKey="deliverables" />
          <ChipList items={(selectedPack.deliverables ?? []).map(labelFromValue)} />
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <PromptLibraryChooser value={settings.promptLibraryPreset} onChange={(value) => updateSetting('promptLibraryPreset', value)} />
            <RubricFocusChooser value={settings.rubricFocus} onChange={(value) => updateSetting('rubricFocus', value)} />
          </div>
          <div className="mt-5">
            <InteractiveLabChooser value={settings.interactiveLab} onChange={(value) => updateSetting('interactiveLab', value)} />
          </div>
        </Panel>
      ),
    },
    {
      title: 'Sources',
      description: 'Add local policy, standards, or notes when needed.',
      complete: true,
      content: (
        <SourceContextPanel
          title="Source / Local Requirements"
          hint="Optional, but powerful: add local standards, policies, or constraints to make the generated package more review-ready."
          policyOutput={settings.policyOutput}
          onPolicyChange={(value) => updateSetting('policyOutput', value)}
          sourceNotes={sourceNotes}
          onSourceNotesChange={setSourceNotes}
          placeholder="Paste standards, school AI policy language, local requirements, employer skill notes, or constraints you want reflected in the generated package."
        />
      ),
    },
  ];

  const previewItems = [
    ['Source', `${selectedUnit.title} / ${selectedModule.title}`],
    ['Classroom', `Grade ${settings.gradeLevel}, ${settings.timeAvailable}, ${settings.classFormat}`],
    ['AI access', selectedAccess?.label ?? labelFromValue(settings.studentAiAccessLevel)],
    ['Output', selectedPack?.label ?? 'Full Lesson Pack'],
    ['Prompt library', selectedPromptLibrary.label],
    ['Rubric', selectedRubricFocus.label],
    ['Interactive lab', selectedInteractiveLab.label],
    ['Standards', `${settings.standardsTarget}: ${standardsSuggestions.length} suggestions`],
    ['Policy', selectedPolicyPreset.label],
    ['AI literacy', aiLiteracyComponents.join(', ')],
  ];

  return (
    <BuilderFrame
      eyebrow="Curriculum Pack"
      title={curriculumWorkflow.title}
      subtitle={curriculumWorkflow.subtitle}
      buttonLabel="Build Curriculum Pack"
      isLoading={isLoading}
      onBuild={buildPrompt}
      steps={steps}
      activeStep={activeStep}
      onStepChange={setActiveStep}
      previewTitle="Live Curriculum Preview"
      previewItems={previewItems}
      summary={[
        ['Source', `${selectedUnit.title} / ${selectedModule.title}`],
        ['Classroom', `Grade ${settings.gradeLevel}, ${settings.timeAvailable}`],
        ['AI access', labelFromValue(settings.studentAiAccessLevel)],
        ['Output', selectedPack?.label ?? 'Full Lesson Pack'],
      ]}
    >
      {steps[activeStep].content}
    </BuilderFrame>
  );
}

function CollegeCourseBuilder({
  isLoading,
  onBuild,
}: {
  isLoading: boolean;
  onBuild: (prompt: string, config: ClassroomConfig) => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [settings, setSettings] = useState({
    courseTitle: 'Introduction to Artificial Intelligence Technology',
    courseLevel: 'Introductory',
    creditHours: '3',
    termLength: '15 weeks',
    deliveryFormat: 'Hybrid',
    targetLearnerProfile: 'Mixed background',
    mathIntensity: 'Conceptual math',
    codingIntensity: 'Beginner Python',
    dataRequirement: 'Small provided datasets',
    labCadence: 'Weekly lab',
    finalProjectType: 'AI portfolio',
    assessmentModel: 'Balanced model',
    outputPreset: 'full_course_package',
    policyOutput: 'College Course AI Policy',
  });
  const [sourceNotes, setSourceNotes] = useState('');

  const outputOptions = getFieldOptions(courseWorkflow, 'course-package-outputs', 'outputPreset') as OptionItem[];
  const selectedOutput = outputOptions.find((option) => option.value === settings.outputPreset) ?? outputOptions[1];

  const updateSetting = (key: keyof typeof settings, value: string) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const buildPrompt = () => {
    const prompt = [
      'Build a syllabus-ready AI Technology college course package for a community-college faculty member/program coordinator.',
      'Label all materials as drafts for faculty, department, and institutional review.',
      '',
      `Course title: ${settings.courseTitle}`,
      `Course level: ${settings.courseLevel}`,
      `Credit hours: ${settings.creditHours}`,
      `Term length: ${settings.termLength}`,
      `Delivery format: ${settings.deliveryFormat}`,
      `Target learners: ${settings.targetLearnerProfile}`,
      `Math intensity: ${settings.mathIntensity}`,
      `Coding intensity: ${settings.codingIntensity}`,
      `Data requirement: ${settings.dataRequirement}`,
      `Lab cadence: ${settings.labCadence}`,
      `Final project type: ${settings.finalProjectType}`,
      `Assessment model: ${settings.assessmentModel}`,
      `Output package: ${selectedOutput.label}`,
      `Included outputs: ${(selectedOutput.includedOutputs ?? []).map(labelFromValue).join(', ')}`,
      `Requested policy artifact: ${settings.policyOutput}`,
      sourceNotes.trim() ? `Additional source/context notes from faculty or program team: ${sourceNotes.trim()}` : 'Additional source/context notes from faculty or program team: none provided.',
      '',
      'Competency focus: AI foundations, Python fundamentals, data analysis, machine learning concepts, generative AI tools, responsible/ethical AI, applied AI projects, communication of findings, career readiness.',
      '',
      'Return concise faculty-ready markdown with these headings: ## Course Snapshot, ## Course Overview, ## Program / Workforce Alignment, ## Course Learning Outcomes, ## Outcomes-to-Assessments Matrix, ## Weekly Modules, ## Labs, ## Assignments, ## Assessments, ## Rubric, ## Final Project, ## Responsible AI Policy, ## HyFlex / Online Delivery Notes, ## CQI Evidence Plan, ## Advisory Board Discussion Prompts, ## Syllabus Draft, ## Slide Deck Outline.',
      'For the outcomes matrix, map outcomes to weekly modules, labs, assessments, and portfolio evidence.',
      'For the CQI evidence plan, include assessment artifacts, review cadence, improvement triggers, and documentation notes.',
      `Include the requested policy artifact as a clearly labeled subsection: ${settings.policyOutput}.`,
      'Include FERPA/privacy cautions, delivery-format notes, beginner supports, applied labs, measurable outcomes, assessment evidence, and workforce relevance. Do not claim official approval or accreditation compliance.',
      'Keep the package practical enough to export directly into HTML, PDF, Markdown, or PPT after faculty review.',
    ].join('\n');

    onBuild(prompt, { ...baseConfig, subjects: 'Artificial Intelligence Technology', grades: 'College intro', standards: { type: 'ISTE' } });
  };

  const steps = [
    {
      title: 'Basics',
      description: 'Name the course, level, credits, term, and delivery format.',
      complete: Boolean(settings.courseTitle && settings.courseLevel && settings.deliveryFormat),
      content: (
        <Panel title="Course Basics" icon={GraduationCap}>
          <GuidanceNote>
            Keep this close to catalog language. The generated package will treat these choices as draft syllabus assumptions for faculty and department review.
          </GuidanceNote>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase text-slate-600">Course title</span>
            <input
              value={settings.courseTitle}
              onChange={(event) => updateSetting('courseTitle', event.target.value)}
              className="h-11 w-full rounded-md border border-slate-300 px-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <FieldGrid>
            <SelectField label="Level" value={settings.courseLevel} onChange={(value) => updateSetting('courseLevel', value)} options={fieldSelectOptions(courseWorkflow, 'course-basics', 'courseLevel')} help="Sets the depth of concepts, labs, vocabulary, and assessments." />
            <SelectField label="Credits" value={settings.creditHours} onChange={(value) => updateSetting('creditHours', value)} options={fieldSelectOptions(courseWorkflow, 'course-basics', 'creditHours')} help="Used to size workload and weekly contact expectations." />
            <SelectField label="Term" value={settings.termLength} onChange={(value) => updateSetting('termLength', value)} options={fieldSelectOptions(courseWorkflow, 'course-basics', 'termLength')} help="Controls the weekly module sequence." />
            <SelectField label="Delivery" value={settings.deliveryFormat} onChange={(value) => updateSetting('deliveryFormat', value)} options={fieldSelectOptions(courseWorkflow, 'course-basics', 'deliveryFormat')} help="Adds face-to-face, online, hybrid, or HyFlex teaching notes." />
            <SelectField label="Learners" value={settings.targetLearnerProfile} onChange={(value) => updateSetting('targetLearnerProfile', value)} options={fieldSelectOptions(courseWorkflow, 'course-basics', 'targetLearnerProfile')} help="Sets beginner supports and prerequisite assumptions." />
          </FieldGrid>
        </Panel>
      ),
    },
    {
      title: 'Competencies',
      description: 'Set the technical depth for AI, coding, math, and data.',
      complete: Boolean(settings.mathIntensity && settings.codingIntensity && settings.dataRequirement),
      content: (
        <Panel title="Competency Focus" icon={Layers3}>
          <GuidanceNote>
            These defaults map tightly to the AI faculty/program-coordinator role: foundations, Python, data, ML, generative AI, ethics, and career readiness.
          </GuidanceNote>
          <ChipList items={['AI foundations', 'Python', 'Data analysis', 'Machine learning', 'Generative AI', 'Responsible AI', 'Career readiness']} />
          <FieldGrid>
            <SelectField label="Math" value={settings.mathIntensity} onChange={(value) => updateSetting('mathIntensity', value)} options={fieldSelectOptions(courseWorkflow, 'competency-focus', 'mathIntensity')} help="Choose conceptual math unless the course explicitly requires formulas or quantitative work." />
            <SelectField label="Coding" value={settings.codingIntensity} onChange={(value) => updateSetting('codingIntensity', value)} options={fieldSelectOptions(courseWorkflow, 'competency-focus', 'codingIntensity')} help="Sets Python scaffolding, lab detail, and troubleshooting support." />
            <SelectField label="Data" value={settings.dataRequirement} onChange={(value) => updateSetting('dataRequirement', value)} options={fieldSelectOptions(courseWorkflow, 'competency-focus', 'dataRequirement')} help="Shapes examples, datasets, and privacy/data governance cautions." />
          </FieldGrid>
        </Panel>
      ),
    },
    {
      title: 'Applied Work',
      description: 'Choose labs, projects, and assessment model.',
      complete: Boolean(settings.labCadence && settings.finalProjectType && settings.assessmentModel),
      content: (
        <Panel title="Applied Learning and Assessment" icon={ClipboardList}>
          <GuidanceNote>
            Applied evidence is what makes the course credible: labs, notebooks, ethics cases, portfolio artifacts, and a final project.
          </GuidanceNote>
          <FieldGrid>
            <SelectField label="Labs" value={settings.labCadence} onChange={(value) => updateSetting('labCadence', value)} options={fieldSelectOptions(courseWorkflow, 'applied-learning', 'labCadence')} help="Controls how often students produce hands-on evidence." />
            <SelectField label="Final project" value={settings.finalProjectType} onChange={(value) => updateSetting('finalProjectType', value)} options={fieldSelectOptions(courseWorkflow, 'applied-learning', 'finalProjectType')} help="Becomes the capstone or portfolio spine." />
            <SelectField label="Assessment" value={settings.assessmentModel} onChange={(value) => updateSetting('assessmentModel', value)} options={fieldSelectOptions(courseWorkflow, 'assessment-cqi', 'assessmentModel')} help="Balances labs, quizzes, projects, reflection, and practical demonstrations." />
          </FieldGrid>
          <ChipList items={['Coding labs', 'Data notebooks', 'Ethics cases', 'Portfolio artifacts', 'Capstone project']} />
        </Panel>
      ),
    },
    {
      title: 'Outputs',
      description: 'Pick the course packet to generate.',
      complete: Boolean(settings.outputPreset),
      content: (
        <Panel title="Course Package Outputs" icon={CheckCircle2}>
          <GuidanceNote>
            Full Course Package is best for a first build. Program Coordinator Packet is best when the output needs CQI, advisory board, or workforce alignment evidence.
          </GuidanceNote>
          <CardOptions value={settings.outputPreset} onChange={(value) => updateSetting('outputPreset', value)} options={outputOptions} detailKey="includedOutputs" />
          <ChipList items={(selectedOutput.includedOutputs ?? []).map(labelFromValue)} />
        </Panel>
      ),
    },
    {
      title: 'Sources',
      description: 'Add institutional notes, employer skills, or policy language.',
      complete: true,
      content: (
        <SourceContextPanel
          title="Source / Local Requirements"
          hint="Optional, but powerful: add institutional notes, employer skills, or policy language to make the course package review-ready."
          policyOutput={settings.policyOutput}
          onPolicyChange={(value) => updateSetting('policyOutput', value)}
          sourceNotes={sourceNotes}
          onSourceNotesChange={setSourceNotes}
          placeholder="Paste program outcomes, local workforce needs, advisory board notes, syllabus constraints, institutional policy language, or accreditation/CQI expectations."
        />
      ),
    },
  ];

  return (
    <BuilderFrame
      eyebrow="College Course"
      title={courseWorkflow.title}
      subtitle={courseWorkflow.subtitle}
      buttonLabel="Build Course"
      isLoading={isLoading}
      onBuild={buildPrompt}
      steps={steps}
      activeStep={activeStep}
      onStepChange={setActiveStep}
      previewTitle="Live Course Preview"
      previewItems={[
        ['Course', settings.courseTitle],
        ['Format', `${settings.creditHours} credits, ${settings.termLength}, ${settings.deliveryFormat}`],
        ['Technical depth', `${settings.codingIntensity}, ${settings.mathIntensity}, ${settings.dataRequirement}`],
        ['Applied work', `${settings.labCadence}, ${settings.finalProjectType}, ${settings.assessmentModel}`],
        ['Output', selectedOutput.label],
      ]}
      summary={[
        ['Course', settings.courseTitle],
        ['Format', `${settings.creditHours} credits, ${settings.termLength}, ${settings.deliveryFormat}`],
        ['Learners', settings.targetLearnerProfile],
        ['Output', selectedOutput.label],
      ]}
    >
      {steps[activeStep].content}
    </BuilderFrame>
  );
}

function CollegeProgramBuilder({
  isLoading,
  onBuild,
}: {
  isLoading: boolean;
  onBuild: (prompt: string, config: ClassroomConfig) => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [settings, setSettings] = useState({
    programName: 'Artificial Intelligence Technology',
    credentialType: 'Technical certificate + AAS pathway',
    programLength: '2 semesters certificate / 4 semesters AAS',
    targetLearners: 'Community college students and working adults',
    workforceFocus: 'Applied AI technician, data assistant, automation support, prompt operations',
    pathwayModel: 'Stackable certificate to associate degree',
    cqiCadence: 'Semester review with annual advisory board input',
    advisoryFocus: 'Employer skill validation and internship/project feedback',
    recruitmentAngle: 'Career-ready AI skills for local workforce needs',
    packagePreset: 'Program Proposal Package',
    policyOutput: 'Department Review Draft',
  });
  const [sourceNotes, setSourceNotes] = useState('');

  const updateSetting = (key: keyof typeof settings, value: string) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const buildPrompt = () => {
    const prompt = [
      'Build a review-ready Artificial Intelligence Technology college program package for a community-college faculty member/program coordinator.',
      'Label all materials as drafts for department, advisory board, workforce partner, and institutional review.',
      '',
      `Program name: ${settings.programName}`,
      `Credential type: ${settings.credentialType}`,
      `Program length: ${settings.programLength}`,
      `Target learners: ${settings.targetLearners}`,
      `Workforce focus: ${settings.workforceFocus}`,
      `Pathway model: ${settings.pathwayModel}`,
      `CQI cadence: ${settings.cqiCadence}`,
      `Advisory board focus: ${settings.advisoryFocus}`,
      `Recruitment angle: ${settings.recruitmentAngle}`,
      `Requested package preset: ${settings.packagePreset}`,
      `Requested policy artifact: ${settings.policyOutput}`,
      sourceNotes.trim() ? `Additional program source/context notes: ${sourceNotes.trim()}` : 'Additional program source/context notes: none provided.',
      '',
      'Return a program-coordinator package with these headings: ## Program Snapshot, ## Market / Workforce Rationale, ## Credential Pathways, ## Program Learning Outcomes, ## Course Sequence, ## Course Descriptions, ## Outcomes-to-Courses Curriculum Map, ## Applied Lab and Project Spine, ## Assessment and CQI Plan, ## Advisory Board Agenda, ## Employer / Internship Partnership Targets, ## Recruitment Copy, ## Student Success Supports, ## Responsible AI Program Policy, ## Implementation Roadmap, ## Department Review Checklist.',
      'For credential pathways, include certificate and associate-degree options with stackable milestones.',
      'For the curriculum map, map program outcomes to courses, labs/projects, assessment evidence, and CQI review points.',
      'For CQI, include artifacts to collect, review cadence, improvement triggers, and documentation notes.',
      'For advisory board, include agenda items, employer feedback questions, and how feedback updates curriculum.',
      'For recruitment copy, include short website copy, flyer copy, and talking points for information sessions.',
      settings.packagePreset === 'Program Proposal Package'
        ? 'Because Program Proposal Package is selected, include a formal proposal-style packet with rationale, outcomes, course sequence, resources, staffing assumptions, lab/tool needs, assessment/CQI, advisory input, implementation timeline, and recruitment copy.'
        : `Shape the package for this selected preset: ${settings.packagePreset}.`,
      `Include the requested policy artifact as a clearly labeled subsection: ${settings.policyOutput}.`,
      'Do not claim official approval, accreditation compliance, or labor-market guarantees.',
    ].join('\n');

    onBuild(prompt, { ...baseConfig, subjects: 'Artificial Intelligence Technology Program', grades: 'College intro', standards: { type: 'ISTE' } });
  };

  const steps = [
    {
      title: 'Basics',
      description: 'Set credential, length, learners, and pathway.',
      complete: Boolean(settings.programName && settings.credentialType && settings.pathwayModel),
      content: (
        <Panel title="Program Basics" icon={GraduationCap}>
          <GuidanceNote>
            This mode is for certificates, pathways, CQI evidence, advisory boards, and recruitment assets. Keep the basics broad enough for institutional review.
          </GuidanceNote>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase text-slate-600">Program name</span>
            <input
              value={settings.programName}
              onChange={(event) => updateSetting('programName', event.target.value)}
              className="h-11 w-full rounded-md border border-slate-300 px-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <FieldGrid>
            <SelectField label="Credential" value={settings.credentialType} onChange={(value) => updateSetting('credentialType', value)} options={toSelectOptions(['Technical certificate', 'AAS degree', 'Technical certificate + AAS pathway', 'Noncredit workforce certificate', 'Dual enrollment pathway'])} help="Determines whether the output reads like a short certificate, degree pathway, or stacked credential." />
            <SelectField label="Length" value={settings.programLength} onChange={(value) => updateSetting('programLength', value)} options={toSelectOptions(['1 semester certificate', '2 semesters certificate / 4 semesters AAS', '3-semester accelerated', '4 semesters AAS', 'Custom'])} help="Sizes the course sequence and implementation roadmap." />
            <SelectField label="Learners" value={settings.targetLearners} onChange={(value) => updateSetting('targetLearners', value)} options={toSelectOptions(['Community college students and working adults', 'Recent high school graduates', 'Working adults / reskilling', 'Dual enrollment students', 'Mixed background learners'])} help="Shapes student success supports, recruitment copy, and prerequisite assumptions." />
            <SelectField label="Pathway" value={settings.pathwayModel} onChange={(value) => updateSetting('pathwayModel', value)} options={toSelectOptions(['Stackable certificate to associate degree', 'Direct AAS pathway', 'Short-term workforce certificate', 'Transfer-informed pathway', 'Employer-sponsored cohort'])} help="Frames certificate milestones and degree progression." />
            <SelectField label="Package" value={settings.packagePreset} onChange={(value) => updateSetting('packagePreset', value)} options={toSelectOptions(['Program Proposal Package', 'Certificate Pathway Package', 'AAS Degree Pathway Package', 'Advisory Board Package', 'Recruitment Package'])} help="Program Proposal Package is the most complete institutional-review output." />
          </FieldGrid>
        </Panel>
      ),
    },
    {
      title: 'Workforce',
      description: 'Describe local roles, tools, and applied AI skills.',
      complete: Boolean(settings.workforceFocus),
      content: (
        <Panel title="Workforce and Applied Learning" icon={Layers3}>
          <GuidanceNote>
            The stronger this section is, the stronger the program proposal becomes for advisory board and workforce alignment conversations.
          </GuidanceNote>
          <TextAreaField
            label="Workforce focus"
            value={settings.workforceFocus}
            onChange={(value) => updateSetting('workforceFocus', value)}
            placeholder="Describe local roles, employer needs, tools, or applied AI skills."
          />
          <ChipList items={['Python foundations', 'Data analysis', 'ML concepts', 'Generative AI tools', 'Ethics', 'Automation projects', 'Portfolio evidence']} />
        </Panel>
      ),
    },
    {
      title: 'CQI',
      description: 'Set review cadence, advisory focus, and recruitment angle.',
      complete: Boolean(settings.cqiCadence && settings.advisoryFocus && settings.recruitmentAngle),
      content: (
        <Panel title="CQI and Advisory Board" icon={ClipboardList}>
          <GuidanceNote>
            CQI and advisory board evidence are the program-coordinator differentiators. This is where the package becomes more than a course list.
          </GuidanceNote>
          <FieldGrid>
            <SelectField label="CQI cadence" value={settings.cqiCadence} onChange={(value) => updateSetting('cqiCadence', value)} options={toSelectOptions(['Semester review with annual advisory board input', 'Annual program review', 'Midterm and end-of-term evidence review', 'Quarterly employer feedback cycle', 'Custom'])} help="Controls how evidence is collected, reviewed, and turned into improvements." />
            <SelectField label="Advisory focus" value={settings.advisoryFocus} onChange={(value) => updateSetting('advisoryFocus', value)} options={toSelectOptions(['Employer skill validation and internship/project feedback', 'Course sequence review', 'Tool/platform relevance', 'Workforce placement feedback', 'Recruitment and retention feedback'])} help="Shapes the advisory board agenda and employer feedback questions." />
          </FieldGrid>
          <TextAreaField
            label="Recruitment angle"
            value={settings.recruitmentAngle}
            onChange={(value) => updateSetting('recruitmentAngle', value)}
            placeholder="Describe how the program should be positioned to students, parents, employers, and internal stakeholders."
          />
        </Panel>
      ),
    },
    {
      title: 'Sources',
      description: 'Add advisory notes, employer needs, or institutional constraints.',
      complete: true,
      content: (
        <SourceContextPanel
          title="Source / Local Requirements"
          hint="Optional, but powerful: add employer input, advisory notes, pathway constraints, or institutional policy language to shape the program package."
          policyOutput={settings.policyOutput}
          onPolicyChange={(value) => updateSetting('policyOutput', value)}
          sourceNotes={sourceNotes}
          onSourceNotesChange={setSourceNotes}
          placeholder="Paste advisory board notes, local employer needs, program outcomes, TBR/institution constraints, recruitment requirements, or CQI expectations."
        />
      ),
    },
  ];

  return (
    <BuilderFrame
      eyebrow="College Program"
      title="Build an AI Technology Program Package"
      subtitle="Create certificate and pathway drafts with outcomes, course sequences, CQI evidence, advisory board materials, and recruitment assets."
      buttonLabel="Build Program Package"
      isLoading={isLoading}
      onBuild={buildPrompt}
      steps={steps}
      activeStep={activeStep}
      onStepChange={setActiveStep}
      previewTitle="Live Program Preview"
      previewItems={[
        ['Program', settings.programName],
        ['Credential', settings.credentialType],
        ['Pathway', settings.pathwayModel],
        ['Workforce focus', settings.workforceFocus],
        ['CQI / advisory', `${settings.cqiCadence}; ${settings.advisoryFocus}`],
      ]}
      summary={[
        ['Program', settings.programName],
        ['Credential', settings.credentialType],
        ['Pathway', settings.pathwayModel],
        ['CQI', settings.cqiCadence],
      ]}
    >
      {steps[activeStep].content}
    </BuilderFrame>
  );
}

function ProductEdgeStrip() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mb-5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm" aria-label="Classroom Copilot product strengths">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span>
          <span className="block text-sm font-bold text-slate-950">Built for source-grounded curriculum work</span>
          <span className="text-xs text-slate-600">Evidence-ready packages, AI guardrails, and exportable teaching assets.</span>
        </span>
        <span className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-blue-800">{open ? 'Hide' : 'Why it matters'}</span>
      </button>
      {open && (
        <div className="mt-3 grid gap-3 lg:grid-cols-4">
          {productEdges.map((edge) => (
            <div key={edge.title} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="mb-1 flex items-center gap-2 text-sm font-bold text-blue-800">
                <CheckCircle2 className="h-4 w-4" />
                {edge.title}
              </div>
              <p className="text-sm leading-5 text-slate-600">{edge.text}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AccessibilityControls({
  fontScale,
  onFontScaleChange,
  highContrast,
  onHighContrastChange,
}: {
  fontScale: FontScale;
  onFontScaleChange: (value: FontScale) => void;
  highContrast: boolean;
  onHighContrastChange: (value: boolean) => void;
}) {
  return (
    <section className="mb-5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm" aria-label="Accessibility display controls">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-2">
          <Languages className="mt-0.5 h-5 w-5 text-blue-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-950">Accessibility and Language Readiness</h3>
            <p className="text-xs leading-5 text-slate-600">Adjust display size and contrast while generated materials continue to include reading-level supports.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid grid-cols-3 gap-1 rounded-md border border-slate-200 bg-slate-100 p-1" aria-label="Font size">
            {([
              ['standard', 'Standard'],
              ['large', 'Large'],
              ['extra-large', 'XL'],
            ] as Array<[FontScale, string]>).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onFontScaleChange(value)}
                className={`min-h-9 rounded px-3 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  fontScale === value ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(event) => onHighContrastChange(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
            />
            High contrast
          </label>
        </div>
      </div>
    </section>
  );
}

function WorkflowMap() {
  const steps = ['Start from', 'Set context', 'Add sources', 'Build', 'Review / export'];

  return (
    <div className="mb-5 grid gap-2 rounded-lg border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-600 sm:grid-cols-5">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-700 text-[11px] text-white">{index + 1}</span>
          <span>{step}</span>
        </div>
      ))}
    </div>
  );
}

function StartFromGallery({
  activeMode,
  onLoadSample,
}: {
  activeMode: BuilderMode;
  onLoadSample: (sample: (typeof samplePackages)[number]) => void;
}) {
  const visibleSamples = samplePackages.filter((sample) => sample.mode === activeMode);

  return (
    <section className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Library className="h-5 w-5 text-blue-700" />
        <div>
          <h3 className="font-bold text-slate-950">Start From</h3>
          <p className="text-xs text-slate-600">Use a sample, the built-in curriculum map, an upload, or your own notes.</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visibleSamples.map((sample) => (
          <button
            key={sample.title}
            type="button"
            onClick={() => onLoadSample(sample)}
            className="rounded-md border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
          >
            <strong className="block text-sm text-slate-950">{sample.title}</strong>
            <span className="mt-1 block text-xs leading-5 text-slate-600">{sample.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function BuilderFrame({
  eyebrow,
  title,
  subtitle,
  buttonLabel,
  isLoading,
  onBuild,
  summary,
  steps,
  activeStep = 0,
  onStepChange,
  previewTitle = 'Live Package Preview',
  previewItems,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  isLoading: boolean;
  onBuild: () => void;
  summary: Array<[string, string]>;
  steps?: BuilderStep[];
  activeStep?: number;
  onStepChange?: (step: number) => void;
  previewTitle?: string;
  previewItems?: Array<[string, string]>;
  children: React.ReactNode;
}) {
  const canGoBack = Boolean(steps && onStepChange && activeStep > 0);
  const canGoNext = Boolean(steps && onStepChange && activeStep < steps.length - 1);

  return (
    <section className="mb-6">
      {steps ? (
        <StepProgress steps={steps} activeStep={activeStep} onStepChange={onStepChange} />
      ) : (
        <WorkflowMap />
      )}
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase text-blue-800">{eyebrow}</p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
          <p className="mt-2 max-w-3xl text-slate-600">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onBuild}
          disabled={isLoading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Sparkles className="h-4 w-4" />
          {isLoading ? 'Building...' : buttonLabel}
        </button>
      </div>

      <div className="mb-5 grid overflow-hidden rounded-lg bg-slate-900 text-white lg:grid-cols-4">
        {summary.map(([label, value]) => (
          <div key={label} className="border-b border-white/10 p-4 lg:border-b-0 lg:border-r lg:last:border-r-0">
            <span className="block text-xs text-slate-300">{label}</span>
            <strong className="mt-1 block text-sm leading-5">{value}</strong>
          </div>
        ))}
      </div>

      {steps && previewItems ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            {children}
            <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => onStepChange?.(Math.max(activeStep - 1, 0))}
                disabled={!canGoBack}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              {canGoNext ? (
                <button
                  type="button"
                  onClick={() => onStepChange?.(Math.min(activeStep + 1, steps.length - 1))}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onBuild}
                  disabled={isLoading}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" />
                  {isLoading ? 'Building...' : buttonLabel}
                </button>
              )}
            </div>
          </div>
          <LivePreview title={previewTitle} items={previewItems} steps={steps} activeStep={activeStep} />
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function StepProgress({
  steps,
  activeStep,
  onStepChange,
}: {
  steps: BuilderStep[];
  activeStep: number;
  onStepChange?: (step: number) => void;
}) {
  return (
    <nav className="mb-5 grid gap-2 rounded-lg border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-600 md:grid-cols-3 xl:grid-cols-5" aria-label="Build progress">
      {steps.map((step, index) => {
        const isActive = index === activeStep;
        return (
          <button
            key={step.title}
            type="button"
            onClick={() => onStepChange?.(index)}
            className={`flex min-h-14 items-start gap-2 rounded-md px-3 py-2 text-left transition ${
              isActive ? 'bg-blue-700 text-white' : 'bg-slate-50 hover:bg-blue-50 hover:text-blue-900'
            }`}
          >
            <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[11px] ${
              isActive ? 'bg-white text-blue-800' : step.complete ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {step.complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span>
              <span className="block">{step.title}</span>
              <span className={`mt-0.5 block text-[11px] font-medium leading-4 ${isActive ? 'text-blue-50' : 'text-slate-500'}`}>{step.description}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function LivePreview({
  title,
  items,
  steps,
  activeStep,
}: {
  title: string;
  items: Array<[string, string]>;
  steps: BuilderStep[];
  activeStep: number;
}) {
  const completeCount = steps.filter((step) => step.complete).length;

  return (
    <aside className="h-fit rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-32">
      <div className="mb-3 flex items-center gap-2">
        <Eye className="h-5 w-5 text-blue-700" />
        <div>
          <h3 className="font-bold text-slate-950">{title}</h3>
          <p className="text-xs text-slate-600">{completeCount} of {steps.length} decisions ready</p>
        </div>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-blue-700 transition-all" style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }} />
      </div>
      <dl className="space-y-3">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm font-semibold leading-5 text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs leading-5 text-slate-600">
        This preview updates as you choose options, so you can build confidence before generating the full package.
      </p>
    </aside>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="mb-4 flex items-center gap-3">
        <Icon className="h-5 w-5 text-blue-700" />
        <h3 className="text-lg font-bold">{title}</h3>
      </header>
      {children}
    </article>
  );
}

function GuidanceNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-950">
      <HelpCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <p>{children}</p>
    </div>
  );
}

function QuickStartGrid({
  quickStarts,
  onApply,
}: {
  quickStarts: typeof curriculumQuickStarts;
  onApply: (quickStart: (typeof curriculumQuickStarts)[number]) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold uppercase text-slate-600">Teacher Quick Starts</div>
      <div className="grid gap-3 lg:grid-cols-3">
        {quickStarts.map((quickStart) => (
          <button
            key={quickStart.title}
            type="button"
            onClick={() => onApply(quickStart)}
            className="rounded-md border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
          >
            <strong className="block text-sm text-slate-950">{quickStart.title}</strong>
            <span className="mt-1 block text-xs leading-5 text-slate-600">{quickStart.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function LiteracyComponentStrip() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <BrainCircuit className="h-4 w-4 text-blue-700" />
        <h4 className="text-sm font-bold text-slate-950">AI literacy components included by default</h4>
      </div>
      <ChipList items={aiLiteracyComponents} />
    </div>
  );
}

function StandardsAlignmentPreview({
  subject,
  standardsTarget,
  suggestions,
}: {
  subject: string;
  standardsTarget: string;
  suggestions: string[];
}) {
  return (
    <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-700" />
        <div>
          <h4 className="text-sm font-bold text-slate-950">Standards / Outcomes Suggestions</h4>
          <p className="text-xs leading-5 text-slate-600">
            Draft suggestions for {subject} using {standardsTarget}. Final alignment should be reviewed by the educator or school.
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <div key={suggestion} className="rounded-md border border-slate-200 bg-white p-2 text-xs leading-5 text-slate-700">
            {suggestion}
          </div>
        ))}
      </div>
    </div>
  );
}

function PolicyCheckPanel({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = policyPresetOptions.find((option) => option.value === value) ?? policyPresetOptions[1];

  return (
    <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-start gap-2">
        <LockKeyhole className="mt-0.5 h-4 w-4 text-blue-700" />
        <div>
          <h4 className="text-sm font-bold text-slate-950">Policy Check</h4>
          <p className="text-xs leading-5 text-slate-600">Adds a policy alignment summary and privacy checklist to the generated package.</p>
        </div>
      </div>
      <SegmentedOptions value={value} onChange={onChange} options={policyPresetOptions} />
      <div className="mt-3 rounded-md border border-blue-100 bg-white p-3">
        <div className="text-xs font-bold uppercase text-slate-600">Selected policy language</div>
        <p className="mt-1 text-sm leading-6 text-slate-700">{selected.description}</p>
        <div className="mt-2">
          <ChipList items={selected.guardrails} />
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {policyCheckItems.map((item) => (
          <div key={item} className="flex items-start gap-2 rounded-md bg-white px-3 py-2 text-xs leading-5 text-slate-700">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-700" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PromptLibraryChooser({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = promptLibraryOptions.find((option) => option.value === value) ?? promptLibraryOptions[0];

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-start gap-2">
        <Clipboard className="mt-0.5 h-4 w-4 text-blue-700" />
        <div>
          <h4 className="text-sm font-bold text-slate-950">Prompt Library</h4>
          <p className="text-xs leading-5 text-slate-600">Adds scaffolded teacher and student prompt stems.</p>
        </div>
      </div>
      <SelectField label="Prompt focus" value={value} onChange={onChange} options={promptLibraryOptions} help="Choose the prompt skill students should practice in this package." />
      <div className="mt-3 space-y-2">
        {selected.prompts.map((prompt) => (
          <div key={prompt} className="rounded-md border border-slate-200 bg-white p-2 text-xs leading-5 text-slate-700">
            {prompt}
          </div>
        ))}
      </div>
    </div>
  );
}

function RubricFocusChooser({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = rubricFocusOptions.find((option) => option.value === value) ?? rubricFocusOptions[0];

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-start gap-2">
        <Gauge className="mt-0.5 h-4 w-4 text-blue-700" />
        <div>
          <h4 className="text-sm font-bold text-slate-950">AI Evaluation Rubric</h4>
          <p className="text-xs leading-5 text-slate-600">Adds criteria for judging AI use and AI outputs.</p>
        </div>
      </div>
      <SelectField label="Rubric focus" value={value} onChange={onChange} options={rubricFocusOptions} help="Choose how students should be assessed when working with AI or AI examples." />
      <div className="mt-3">
        <ChipList items={selected.criteria} />
      </div>
    </div>
  );
}

function InteractiveLabChooser({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = interactiveLabOptions.find((option) => option.value === value) ?? interactiveLabOptions[1];

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-start gap-2">
        <BrainCircuit className="mt-0.5 h-4 w-4 text-blue-700" />
        <div>
          <h4 className="text-sm font-bold text-slate-950">Interactive AI Lab</h4>
          <p className="text-xs leading-5 text-slate-600">Adds a safe hands-on learning experience to the generated curriculum pack.</p>
        </div>
      </div>
      <CardOptions value={value} onChange={onChange} options={interactiveLabOptions} detailKey="includedOutputs" />
      <div className="rounded-md border border-blue-100 bg-white p-3">
        <div className="text-xs font-bold uppercase text-slate-600">Lab flow</div>
        <div className="mt-2">
          <ChipList items={selected.steps} />
        </div>
      </div>
    </div>
  );
}

function DataPrivacyPanel() {
  const items = [
    'Source text is used to shape the generated package and should be reviewed before submission.',
    'Do not upload student names, grades, IEP/504 details, family information, or private identifiers.',
    'Saved Package History is stored in this browser, not as a shared school record system.',
    'Exports should be reviewed by the educator before sharing with students, families, or administrators.',
  ];

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-start gap-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 text-blue-700" />
        <div>
          <h4 className="text-sm font-bold text-slate-950">Data Privacy Transparency</h4>
          <p className="text-xs leading-5 text-slate-600">Use source uploads for public or de-identified planning material only.</p>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 rounded-md bg-white px-3 py-2 text-xs leading-5 text-slate-700">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-700" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SourceContextPanel({
  title,
  hint,
  policyOutput,
  onPolicyChange,
  sourceNotes,
  onSourceNotesChange,
  placeholder,
}: {
  title: string;
  hint: string;
  policyOutput: string;
  onPolicyChange: (value: string) => void;
  sourceNotes: string;
  onSourceNotesChange: (value: string) => void;
  placeholder: string;
}) {
  const [uploadStatus, setUploadStatus] = useState('');
  const [libraryItems, setLibraryItems] = useState<string[]>(() => loadStandardsLibrary());
  const [newLibraryItem, setNewLibraryItem] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    saveStandardsLibrary(libraryItems);
  }, [libraryItems]);

  const appendSourceText = (label: string, text: string) => {
    const clipped = text.trim().slice(0, 12000);
    if (!clipped) return;
    onSourceNotesChange([sourceNotes, `\n\n[${label}]\n${clipped}`].join('').trim());
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadStatus(`Reading ${files.length} file${files.length > 1 ? 's' : ''}...`);

    const extracted: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const text = await extractTextFromFile(file);
        extracted.push(`[Uploaded source: ${file.name}]\n${text}`);
      } catch (error) {
        console.error('File extraction failed:', error);
        extracted.push(`[Uploaded source: ${file.name}]\nUnable to extract text. Add notes manually or try a text/Markdown export of this file.`);
      }
    }

    appendSourceText('Uploaded files', extracted.join('\n\n'));
    setUploadStatus(`Added ${files.length} source file${files.length > 1 ? 's' : ''}.`);
    window.setTimeout(() => setUploadStatus(''), 3500);
  };

  const addLibraryItem = () => {
    const trimmed = newLibraryItem.trim();
    if (!trimmed) return;
    setLibraryItems((current) => [trimmed, ...current].slice(0, 20));
    setNewLibraryItem('');
  };

  return (
    <Panel title={title} icon={Upload}>
      <div className="mb-4 flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <p>{hint}</p>
      </div>

      <DataPrivacyPanel />

      <SelectField label="AI Policy to Include" value={policyOutput} onChange={onPolicyChange} options={toSelectOptions(policyOptions)} />

      <label className="mt-4 block rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-600">
          <Upload className="h-4 w-4" />
          Upload source files
        </span>
        <div className="mb-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>Privacy check: remove student names, grades, IEP/504 details, family information, and other personally identifiable information before uploading.</span>
        </div>
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md,.csv,.rtf"
          onChange={(event) => void handleFiles(event.target.files)}
          className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-blue-700 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
        <span className="mt-2 block text-xs leading-5 text-slate-500">Supports PDF, DOCX, TXT, Markdown, CSV, and RTF text extraction in this browser.</span>
        {uploadStatus && <span className="mt-2 block text-xs font-semibold text-blue-800">{uploadStatus}</span>}
      </label>

      <TextAreaField label="Source / Local Requirements" value={sourceNotes} onChange={onSourceNotesChange} placeholder={placeholder} />

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <button
          type="button"
          onClick={() => setAdvancedOpen((current) => !current)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="flex items-center gap-2 font-bold text-slate-950">
            <Library className="h-4 w-4 text-blue-700" />
            Advanced: Standards / Outcomes Library
          </span>
          <span className="text-xs font-semibold text-blue-800">{advancedOpen ? 'Hide' : 'Show'}</span>
        </button>
        {advancedOpen && (
          <div className="mt-3">
            <div className="mb-3 flex gap-2">
              <input
                value={newLibraryItem}
                onChange={(event) => setNewLibraryItem(event.target.value)}
                placeholder="Add an outcome, standard, skill, or CQI evidence note..."
                className="min-h-10 flex-1 rounded-md border border-slate-300 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <button type="button" onClick={addLibraryItem} className="rounded-md bg-blue-700 px-3 text-sm font-semibold text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                Add
              </button>
            </div>
            <div className="space-y-2">
              {libraryItems.slice(0, 6).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => appendSourceText('Standards / outcomes library', item)}
                  className="block w-full rounded-md border border-slate-200 bg-white p-2 text-left text-xs leading-5 text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}

function ModulePreview({ module }: { module: CurriculumModule }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="mb-2 text-xs font-bold uppercase text-slate-600">Essential question</p>
      <strong className="block text-slate-950">{module.essentialQuestion}</strong>
      <p className="mb-2 mt-4 text-xs font-bold uppercase text-slate-600">Objectives</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
        {module.objectives.slice(0, 3).map((objective) => (
          <li key={objective}>{objective}</li>
        ))}
      </ul>
      <p className="mb-2 mt-4 text-xs font-bold uppercase text-slate-600">Guardrails</p>
      <ChipList items={module.guardrails} />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: OptionItem[];
  help?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-slate-600">
        {label}
        {help && <HelpCircle className="h-3.5 w-3.5 text-slate-400" aria-label={help} />}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {help && <span className="mt-1 block text-xs leading-5 text-slate-500">{help}</span>}
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-xs font-bold uppercase text-slate-600">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={5}
        className="w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-3 text-sm leading-6 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function SegmentedOptions({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: OptionItem[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-lg border p-3 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
            value === option.value ? 'border-blue-700 bg-blue-50 text-blue-900' : 'border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function CardOptions({
  value,
  onChange,
  options,
  detailKey,
}: {
  value: string;
  onChange: (value: string) => void;
  options: OptionItem[];
  detailKey: 'deliverables' | 'includedOutputs';
}) {
  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const details = detailKey === 'deliverables' ? option.deliverables : option.includedOutputs;
        const description = option.description ?? deliverableDescriptions[option.value];
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-lg border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
              value === option.value ? 'border-blue-700 bg-blue-50 text-blue-900' : 'border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <strong className="block">{option.label}</strong>
            {description && <span className="mt-1 block text-xs leading-5 text-slate-600">{description}</span>}
            <span className="mt-2 block text-xs font-medium text-slate-500">{(details ?? []).slice(0, 4).map(labelFromValue).join(', ')}</span>
          </button>
        );
      })}
    </div>
  );
}

function ChipList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-xs text-slate-700">
          {item}
        </span>
      ))}
    </div>
  );
}

function GeneratedOutput({
  isLoading,
  content,
  activeMode,
  emptyTitle,
  onImprove,
  onSave,
  savedPackages,
  onLoadPackage,
  onDeletePackage,
}: {
  isLoading: boolean;
  content: string;
  activeMode: BuilderMode;
  emptyTitle: string;
  onImprove: (prompt: string) => void;
  onSave: (content: string, status: ReviewStatus) => void;
  savedPackages: SavedPackage[];
  onLoadPackage: (savedPackage: SavedPackage) => void;
  onDeletePackage: (id: string) => void;
}) {
  const [exportStatus, setExportStatus] = useState('');
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>('Draft');
  const [copyTemplate, setCopyTemplate] = useState<CopyTemplate>('teacher_lesson_deck');
  const hasContent = Boolean(content.trim());
  const filename = `Classroom-Copilot-Package-${new Date().toISOString().slice(0, 10)}`;
  const checks = getReadinessResults(content);
  const missingChecks = checks.filter((check) => !check.met);

  const runExport = async (label: string, action: () => void | Promise<void>) => {
    try {
      await action();
      setExportStatus(label);
      window.setTimeout(() => setExportStatus(''), 3000);
    } catch (exportError) {
      console.error('Export failed:', exportError);
      setExportStatus('Export failed. Try copy or Markdown.');
      window.setTimeout(() => setExportStatus(''), 4500);
    }
  };

  const improveReadiness = () => {
    const missingLabels = missingChecks.map((check) => check.label).join(', ') || 'polish, specificity, and implementation quality';
    onImprove([
      'Improve the generated package below for product readiness.',
      `Focus especially on: ${missingLabels}.`,
      'Preserve useful existing content, but rewrite the package as one complete improved version.',
      'Add any missing standards/outcomes alignment, assessment evidence, AI-use guardrails, privacy language, prompt library, AI evaluation rubric, accessibility supports, family/admin language, bias/inclusivity review notes, data privacy transparency, LMS-ready instructions, student submission evidence, rubric table, and implementation notes.',
      'Include a Policy Alignment Summary when privacy, family/admin language, or AI-use guardrails are missing.',
      'Include copy-ready LMS sections when LMS signals are missing: ## Canvas Module Overview, ## Google Classroom Assignment Post, ## Moodle / Schoology Activity Instructions, ## Student Checklist, ## Submission Evidence, ## Rubric Table, and ## Teacher Announcement.',
      'Use clean markdown headings and keep it ready for export to HTML, print/PDF, Markdown, or PPT.',
      '',
      'Current package:',
      content,
    ].join('\n'));
  };

  const runRefinement = (label: string, instruction: string) => {
    onImprove([
      `Refine the generated package using this focus: ${label}.`,
      instruction,
      'Preserve useful existing content, but return one complete updated package with clean markdown headings.',
      'Keep outcomes alignment, assessment evidence, AI guardrails, accessibility, LMS-ready assignment instructions, export readiness, and implementation details intact.',
      '',
      'Current package:',
      content,
    ].join('\n'));
  };

  const checkBiasAndInclusivity = () => {
    onImprove([
      'Review the generated package below for bias, inclusivity, representation, accessibility, and culturally narrow assumptions.',
      'Return one improved package with the same core learning goals, plus a concise ## Bias and Inclusivity Notes section.',
      'Look for stereotype-reinforcing examples, exclusionary language, inaccessible assumptions, narrow cultural references, unsupported claims about groups, and missing representation.',
      'Preserve standards alignment, AI guardrails, privacy language, assessment evidence, and implementation details.',
      '',
      'Current package:',
      content,
    ].join('\n'));
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-bold">Review Workspace</h3>
          <p className="text-sm text-slate-600">Check readiness, fix missing pieces, export, and save your package.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
          <SelectField label="Review stage" value={reviewStatus} onChange={(value) => setReviewStatus(value as ReviewStatus)} options={toSelectOptions(reviewStatuses)} />
          <SelectField
            label="Export style"
            value={copyTemplate}
            onChange={(value) => setCopyTemplate(value as CopyTemplate)}
            options={toSelectOptions([
              { value: 'teacher_lesson_deck', label: 'Teacher Lesson Deck' },
              { value: 'student_activity_deck', label: 'Student Activity Deck' },
              { value: 'lms_assignment_pack', label: 'LMS Assignment Pack' },
              { value: 'college_syllabus_packet', label: 'College Syllabus Packet' },
              { value: 'program_proposal_deck', label: 'Program Proposal Deck' },
              { value: 'advisory_board_deck', label: 'Advisory Board Deck' },
            ])}
          />
        </div>
        <div className="sticky top-[7.75rem] z-10 -mx-1 flex gap-2 overflow-x-auto bg-white/95 px-1 py-2 backdrop-blur lg:static lg:z-auto lg:flex-wrap lg:overflow-visible lg:bg-transparent lg:p-0">
          <ExportButton
            icon={FileText}
            label="Polished HTML"
            disabled={!hasContent || isLoading}
            onClick={() => runExport('Polished HTML downloaded.', () => exportToHtml(content, filename, copyTemplate))}
          />
          <ExportButton
            icon={Printer}
            label="Print / PDF"
            disabled={!hasContent || isLoading}
            onClick={() => runExport('Print view opened.', () => printFormattedDocument(content, filename, copyTemplate))}
          />
          <ExportButton
            icon={Presentation}
            label="PPT"
            disabled={!hasContent || isLoading}
            onClick={() => runExport('PowerPoint downloaded.', () => exportToPptx(content, filename, copyTemplate))}
          />
          <ExportButton
            icon={Clipboard}
            label="Copy"
            disabled={!hasContent || isLoading}
            onClick={() => runExport('Copied to clipboard.', () => copyToClipboard(content))}
          />
          <ExportButton
            icon={ClipboardList}
            label="Copy LMS"
            disabled={!hasContent || isLoading}
            onClick={() => runExport('LMS assignment block copied.', () => copyToClipboard(buildLmsAssignmentCopy(content)))}
          />
          <ExportButton
            icon={BookOpen}
            label="Markdown"
            disabled={!hasContent || isLoading}
            onClick={() => runExport('Markdown downloaded.', () => exportToMarkdown(content, filename))}
          />
          <ExportButton
            icon={RefreshCw}
            label="Fix Missing Pieces"
            disabled={!hasContent || isLoading}
            onClick={improveReadiness}
          />
          <ExportButton
            icon={ScanSearch}
            label="Bias Check"
            disabled={!hasContent || isLoading}
            onClick={checkBiasAndInclusivity}
          />
          <ExportButton
            icon={Archive}
            label="Save"
            disabled={!hasContent || isLoading}
            onClick={() => {
              onSave(content, reviewStatus);
              setExportStatus('Package saved to history.');
              window.setTimeout(() => setExportStatus(''), 3000);
            }}
          />
        </div>
      </div>
      {hasContent && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 text-xs font-bold uppercase text-slate-600">Refine Package</div>
          <div className="flex flex-wrap gap-2">
            {refinementPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => runRefinement(preset.label, preset.instruction)}
                disabled={isLoading}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {exportStatus && (
        <div className="mb-4 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-900">
          {exportStatus}
        </div>
      )}
      {isLoading ? (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">Building your package...</div>
      ) : hasContent ? (
        <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
          <PackageReadiness checks={checks} />
          <div className="prose prose-slate max-w-none whitespace-pre-wrap text-sm leading-6">{content}</div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">{emptyTitle}</div>
      )}

      <SavedPackagesPanel
        activeMode={activeMode}
        savedPackages={savedPackages}
        onLoadPackage={onLoadPackage}
        onDeletePackage={onDeletePackage}
      />
    </section>
  );
}

function SavedPackagesPanel({
  activeMode,
  savedPackages,
  onLoadPackage,
  onDeletePackage,
}: {
  activeMode: BuilderMode;
  savedPackages: SavedPackage[];
  onLoadPackage: (savedPackage: SavedPackage) => void;
  onDeletePackage: (id: string) => void;
}) {
  const visiblePackages = savedPackages.filter((savedPackage) => savedPackage.mode === activeMode).slice(0, 6);

  return (
    <section className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-blue-700" />
          <div>
            <h4 className="font-bold text-slate-950">Saved Package History</h4>
            <p className="text-xs text-slate-600">Saved in this browser for quick reuse and revision.</p>
          </div>
        </div>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-600">{visiblePackages.length}</span>
      </div>
      {visiblePackages.length > 0 ? (
        <div className="grid gap-2 lg:grid-cols-2">
          {visiblePackages.map((savedPackage) => (
            <div key={savedPackage.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3">
              <button type="button" onClick={() => onLoadPackage(savedPackage)} className="min-w-0 flex-1 text-left">
                <strong className="block truncate text-sm text-slate-950">{savedPackage.title}</strong>
                <span className="text-xs text-slate-500">{savedPackage.status} - {new Date(savedPackage.createdAt).toLocaleString()}</span>
              </button>
              <button
                type="button"
                onClick={() => onDeletePackage(savedPackage.id)}
                className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                aria-label={`Delete ${savedPackage.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
          No saved packages for this mode yet.
        </div>
      )}
    </section>
  );
}

function PackageReadiness({ checks }: { checks: ReadinessResult[] }) {
  const score = checks.filter((check) => check.met).length;
  const missing = checks.filter((check) => !check.met);

  return (
    <aside className="h-fit rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Gauge className="h-5 w-5 text-blue-700" />
        <div>
          <h4 className="font-bold text-slate-950">Package Readiness</h4>
          <p className="text-xs text-slate-600">{score} of {checks.length} product-quality signals detected</p>
        </div>
      </div>
      <div className="space-y-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm">
            <span className="text-slate-700">{check.label}</span>
            <span className={`rounded-md px-2 py-1 text-xs font-bold ${check.met ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              {check.met ? 'Detected' : 'Review'}
            </span>
          </div>
        ))}
      </div>
      {missing.length > 0 && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
          <div className="text-xs font-bold uppercase text-amber-900">Gaps to fix</div>
          <p className="mt-1 text-xs leading-5 text-amber-900">
            {missing.map((check) => check.label).join(', ')}
          </p>
        </div>
      )}
      <p className="mt-3 text-xs leading-5 text-slate-600">
        Use this as a quick QA pass before sharing with teachers, faculty, administrators, or advisory partners.
      </p>
    </aside>
  );
}

interface ReadinessResult {
  label: string;
  terms: string[];
  met: boolean;
}

function getReadinessResults(content: string): ReadinessResult[] {
  const normalized = content.toLowerCase();
  return readinessChecks.map((check) => ({
    ...check,
    met: check.terms.some((term) => normalized.includes(term)),
  }));
}

function ExportButton({
  icon: Icon,
  label,
  disabled,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function getFieldOptions(workflow: WorkflowConfig, sectionId: string, fieldId: string): Array<string | OptionItem> {
  return workflow.sections.find((section) => section.id === sectionId)?.fields.find((field) => field.id === fieldId)?.options ?? [];
}

function fieldSelectOptions(workflow: WorkflowConfig, sectionId: string, fieldId: string): OptionItem[] {
  return toSelectOptions(getFieldOptions(workflow, sectionId, fieldId));
}

function toSelectOptions(options: Array<string | OptionItem>): OptionItem[] {
  return options.map((option) => (typeof option === 'string' ? { value: option, label: option } : option));
}

function labelFromValue(value: string) {
  const label = value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  return label
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bCqi\b/g, 'CQI')
    .replace(/\bHyflex\b/g, 'HyFlex')
    .replace(/\bFerpa\b/g, 'FERPA');
}

function getStandardsSuggestions(subject: string, standardsTarget: string, gradeLevel: string): string[] {
  const subjectSuggestions = standardsSuggestionLibrary[subject] ?? standardsSuggestionLibrary['AI Literacy'];
  const gradeBand = Number(gradeLevel) <= 8 ? 'middle-grade' : Number(gradeLevel) >= 11 ? 'upper-grade' : 'high-school';
  const targetNote =
    standardsTarget === 'None'
      ? 'Local alignment optional: use as draft outcomes instead of formal standards.'
      : `${standardsTarget} alignment note: verify exact local wording before sharing externally.`;

  return [
    targetNote,
    `${gradeBand} outcome: students explain AI limits, verify outputs, and document responsible choices.`,
    ...subjectSuggestions,
  ].slice(0, 5);
}

function normalizeStandards(value: string): ClassroomConfig['standards']['type'] {
  if (value === 'ISTE') return 'ISTE';
  if (value === 'NGSS') return 'NGSS';
  if (value === 'Tennessee') return 'TN';
  if (value === 'Common Core ELA') return 'CCSS';
  if (value === 'CSTA' || value === 'State standards' || value === 'Custom') return 'Custom';
  return null;
}

const savedPackagesKey = 'classroomCopilot.savedPackages.v1';
const standardsLibraryKey = 'classroomCopilot.standardsLibrary.v1';

function loadSavedPackages(): SavedPackage[] {
  try {
    const raw = localStorage.getItem(savedPackagesKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedPackage[];
    return Array.isArray(parsed) ? parsed.filter(isSavedPackage).map((savedPackage) => ({ ...savedPackage, status: savedPackage.status ?? 'Draft' })) : [];
  } catch (error) {
    console.error('Failed to load saved packages:', error);
    return [];
  }
}

function saveSavedPackages(savedPackages: SavedPackage[]): void {
  try {
    localStorage.setItem(savedPackagesKey, JSON.stringify(savedPackages));
  } catch (error) {
    console.error('Failed to save packages:', error);
  }
}

function isSavedPackage(value: SavedPackage): value is SavedPackage {
  return Boolean(value?.id && value?.title && value?.content && value?.createdAt && value?.mode);
}

function inferPackageTitle(content: string, mode: BuilderMode): string {
  const heading = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => /^#{1,3}\s+/.test(line));

  if (heading) {
    return heading.replace(/^#{1,3}\s+/, '').slice(0, 80);
  }

  const fallback = mode === 'curriculum-pack' ? 'Curriculum Pack' : mode === 'college-course' ? 'College Course Package' : 'College Program Package';
  return `${fallback} - ${new Date().toLocaleDateString()}`;
}

function loadStandardsLibrary(): string[] {
  try {
    const raw = localStorage.getItem(standardsLibraryKey);
    if (!raw) return defaultStandardsLibrary;
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed.filter((item) => typeof item === 'string') : defaultStandardsLibrary;
  } catch (error) {
    console.error('Failed to load standards library:', error);
    return defaultStandardsLibrary;
  }
}

function saveStandardsLibrary(items: string[]): void {
  try {
    localStorage.setItem(standardsLibraryKey, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save standards library:', error);
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (extension === 'pdf') {
    return extractPdfText(file);
  }

  if (extension === 'docx') {
    return extractDocxText(file);
  }

  return file.text();
}

async function extractDocxText(file: File): Promise<string> {
  const mammoth = await import('mammoth/mammoth.browser');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (pageText) pages.push(`Page ${pageNumber}: ${pageText}`);
  }

  return pages.join('\n\n');
}

export default App;
