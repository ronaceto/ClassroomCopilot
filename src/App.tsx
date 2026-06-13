import React, { useEffect, useMemo, useState } from 'react';
import {
  Archive,
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
  Library,
  Layers3,
  LibraryBig,
  Presentation,
  Printer,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { useChat } from './hooks/useChat';
import { ClassroomConfig } from './types';
import { CopyTemplate, copyToClipboard, exportToHtml, exportToMarkdown, exportToPptx, printFormattedDocument } from './utils/documentExport';
import curriculumDataJson from '../curriculum-map/data/modules.json';
import curriculumWorkflowJson from '../product-planning/data/build-workflow-config.json';
import courseWorkflowJson from '../product-planning/data/build-college-course-config.json';

type BuilderMode = 'curriculum-pack' | 'college-course' | 'college-program';

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
    label: 'Outcomes alignment',
    terms: ['outcome', 'objective', 'alignment', 'matrix'],
  },
  {
    label: 'Assessment evidence',
    terms: ['assessment', 'rubric', 'evidence', 'quiz'],
  },
  {
    label: 'AI-use guardrails',
    terms: ['guardrail', 'responsible ai', 'privacy', 'ferpa', 'ai use'],
  },
  {
    label: 'Accessibility supports',
    terms: ['differentiation', 'accessibility', 'ell', 'iep', 'beginner support'],
  },
  {
    label: 'Presentation path',
    terms: ['slide', 'deck', 'speaker notes', 'presentation'],
  },
  {
    label: 'Implementation notes',
    terms: ['checklist', 'implementation', 'materials', 'delivery'],
  },
];

const policyOptions = [
  'Classroom AI Use Policy',
  'Student Responsible AI Agreement',
  'Family / Guardian AI Notice',
  'College Course AI Policy',
  'Department Review Draft',
];

const reviewStatuses: ReviewStatus[] = ['Draft', 'Needs Review', 'Faculty Review', 'Advisory Review', 'Ready to Share'];

const defaultStandardsLibrary = [
  'ISTE AI literacy: students evaluate AI outputs, use AI responsibly, protect privacy, and explain limitations.',
  'AI literacy competencies: define AI, identify examples, prompt effectively, verify outputs, cite AI assistance, and reflect on ethical use.',
  'Course outcome: apply Python and data tools to analyze a small dataset and communicate findings.',
  'Program outcome: design, evaluate, and present applied AI solutions that meet ethical, privacy, and workforce expectations.',
  'CQI evidence: collect rubrics, lab artifacts, portfolio samples, advisory feedback, and student reflection data each term.',
];

const refinementPresets = [
  { label: 'Make more rigorous', instruction: 'Increase cognitive rigor with higher-order objectives, more demanding assessment evidence, and stronger success criteria.' },
  { label: 'Add hands-on labs', instruction: 'Add applied labs with materials, steps, data/tools, deliverables, troubleshooting notes, and evidence of learning.' },
  { label: 'Add beginner supports', instruction: 'Add beginner-friendly scaffolds, vocabulary support, examples, accessibility supports, and confidence-building checks.' },
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
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
    policyOutput: 'Classroom AI Use Policy',
  });
  const [sourceNotes, setSourceNotes] = useState('');

  const packOptions = getFieldOptions(curriculumWorkflow, 'deliverables', 'packPreset') as OptionItem[];
  const studentAccessOptions = getFieldOptions(curriculumWorkflow, 'student-ai-access', 'studentAiAccessLevel') as OptionItem[];
  const selectedPack = packOptions.find((option) => option.value === settings.packPreset) ?? packOptions[1];
  const selectedAccess = studentAccessOptions.find((option) => option.value === settings.studentAiAccessLevel);

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
      `Time available: ${settings.timeAvailable}`,
      `Class format: ${settings.classFormat}`,
      `Student AI access level: ${labelFromValue(settings.studentAiAccessLevel)} - ${studentAccessNotes[settings.studentAiAccessLevel]}`,
      `Output package: ${selectedPack.label}`,
      `Included deliverables: ${(selectedPack.deliverables ?? []).map(labelFromValue).join(', ')}`,
      `AI literacy components to emphasize: ${aiLiteracyComponents.join(', ')}`,
      `Requested policy artifact: ${settings.policyOutput}`,
      sourceNotes.trim() ? `Additional source/context notes from educator: ${sourceNotes.trim()}` : 'Additional source/context notes from educator: none provided.',
      '',
      'Return a teacher-ready package with these headings: ## Lesson Snapshot, ## Standards / Outcomes Alignment Matrix, ## Lesson Plan, ## Student Activity, ## Worksheet, ## Quiz, ## Rubric, ## AI Use Guardrails, ## Differentiation and Accessibility, ## Slide Deck Outline, ## Family / Admin Note, ## Teacher Implementation Checklist.',
      'For the alignment matrix, map objectives to activities, assessments, and evidence of learning.',
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
            <SelectField label="Subject" value={settings.subjectContext} onChange={(value) => updateSetting('subjectContext', value)} options={toSelectOptions(['AI Literacy', 'ELA', 'Math', 'Science', 'Social Studies', 'CTE', 'Computer Science', 'Advisory', 'Career Readiness'])} help="Use this when AI literacy is being taught inside another course." />
            <SelectField label="Standards" value={settings.standardsTarget} onChange={(value) => updateSetting('standardsTarget', value)} options={toSelectOptions(['None', 'ISTE', 'Common Core ELA', 'Tennessee', 'Missouri', 'Kansas', 'State standards'])} help="Choose the review target that should appear in the alignment matrix." />
            <SelectField label="Time" value={settings.timeAvailable} onChange={(value) => updateSetting('timeAvailable', value)} options={toSelectOptions(['30 min', '45 min', '60 min', '90 min', '3-day mini-unit', '5-day unit'])} help="Controls pacing, activity depth, and assessment scope." />
            <SelectField label="Format" value={settings.classFormat} onChange={(value) => updateSetting('classFormat', value)} options={toSelectOptions(['Whole class', 'Small group', 'Individual', 'Station rotation', 'Online/asynchronous'])} help="Shapes directions, facilitation notes, and participation structures." />
          </FieldGrid>
          <div className="mt-5">
            <LiteracyComponentStrip />
          </div>
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

      <SelectField label="AI Policy to Include" value={policyOutput} onChange={onPolicyChange} options={toSelectOptions(policyOptions)} />

      <label className="mt-4 block rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-600">
          <Upload className="h-4 w-4" />
          Upload source files
        </span>
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
              <button type="button" onClick={addLibraryItem} className="rounded-md bg-blue-700 px-3 text-sm font-semibold text-white hover:bg-blue-800">
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
          className={`rounded-lg border p-3 text-left text-sm font-semibold transition ${
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
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-lg border p-3 text-left transition ${
              value === option.value ? 'border-blue-700 bg-blue-50 text-blue-900' : 'border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <strong className="block">{option.label}</strong>
            <span className="mt-1 block text-xs text-slate-500">{(details ?? []).slice(0, 3).map(labelFromValue).join(', ')}</span>
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
      'Add any missing outcomes alignment, assessment evidence, AI-use guardrails, accessibility supports, slide/presentation path, and implementation notes.',
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
      'Keep outcomes alignment, assessment evidence, AI guardrails, accessibility, export readiness, and implementation details intact.',
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

function normalizeStandards(value: string): ClassroomConfig['standards']['type'] {
  if (value === 'ISTE') return 'ISTE';
  if (value === 'Tennessee') return 'TN';
  if (value === 'Common Core ELA') return 'CCSS';
  if (value === 'State standards' || value === 'Custom') return 'Custom';
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
