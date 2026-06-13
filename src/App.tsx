import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Clipboard,
  ClipboardList,
  FileText,
  Gauge,
  GraduationCap,
  Layers3,
  LibraryBig,
  Presentation,
  Printer,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useChat } from './hooks/useChat';
import { ClassroomConfig } from './types';
import { copyToClipboard, exportToHtml, exportToMarkdown, exportToPptx, printFormattedDocument } from './utils/documentExport';
import curriculumDataJson from '../curriculum-map/data/modules.json';
import curriculumWorkflowJson from '../product-planning/data/build-workflow-config.json';
import courseWorkflowJson from '../product-planning/data/build-college-course-config.json';

type BuilderMode = 'curriculum-pack' | 'college-course';

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

function App() {
  const [activeMode, setActiveMode] = useState<BuilderMode>('curriculum-pack');
  const [debugOpen, setDebugOpen] = useState(false);
  const { messages, isLoading, error, debugInfo, sendMessage, clearChat } = useChat();

  const handleBuild = (prompt: string, config: ClassroomConfig) => {
    clearChat();
    void sendMessage(prompt, 'teacher', config);
  };

  const handleImprove = (prompt: string) => {
    void sendMessage(prompt, 'teacher', { ...baseConfig, outputDepth: 'Detailed' });
  };

  const latestAssistantMessage = [...messages].reverse().find((message) => message.role === 'assistant');

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

          <nav className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1" aria-label="Builder modes">
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

        {activeMode === 'curriculum-pack' ? (
          <CurriculumPackBuilder isLoading={isLoading} onBuild={handleBuild} />
        ) : (
          <CollegeCourseBuilder isLoading={isLoading} onBuild={handleBuild} />
        )}

        <GeneratedOutput
          isLoading={isLoading}
          content={latestAssistantMessage?.content ?? ''}
          emptyTitle={activeMode === 'curriculum-pack' ? 'Your curriculum pack will appear here' : 'Your course package will appear here'}
          onImprove={handleImprove}
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

  const updateSetting = (key: keyof typeof settings, value: string) => {
    setSettings((current) => ({ ...current, [key]: value }));
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

  return (
    <BuilderFrame
      eyebrow="Curriculum Pack"
      title={curriculumWorkflow.title}
      subtitle={curriculumWorkflow.subtitle}
      buttonLabel="Build Curriculum Pack"
      isLoading={isLoading}
      onBuild={buildPrompt}
      summary={[
        ['Source', `${selectedUnit.title} / ${selectedModule.title}`],
        ['Classroom', `Grade ${settings.gradeLevel}, ${settings.timeAvailable}`],
        ['AI access', labelFromValue(settings.studentAiAccessLevel)],
        ['Output', selectedPack?.label ?? 'Full Lesson Pack'],
      ]}
    >
      <section className="grid gap-5 lg:grid-cols-2">
        <Panel title="Choose Curriculum Source" icon={LibraryBig}>
          <SelectField
            label="Unit"
            value={unitId}
            onChange={(value) => {
              const nextUnit = curriculumData.units.find((unit) => unit.id === value);
              setUnitId(value);
              setModuleId(nextUnit?.modules[0]?.id ?? '');
            }}
            options={curriculumData.units.map((unit) => ({ value: unit.id, label: unit.title }))}
          />
          <SelectField
            label="Module"
            value={selectedModule.id}
            onChange={setModuleId}
            options={selectedUnit.modules.map((module) => ({ value: module.id, label: `${module.chapter}. ${module.title}` }))}
          />
          <ModulePreview module={selectedModule} />
        </Panel>

        <Panel title="Set Classroom Context" icon={SlidersHorizontal}>
          <FieldGrid>
            <SelectField label="Grade" value={settings.gradeLevel} onChange={(value) => updateSetting('gradeLevel', value)} options={toSelectOptions(['6', '7', '8', '9', '10', '11', '12', 'College intro'])} />
            <SelectField label="Reading" value={settings.readingLevel} onChange={(value) => updateSetting('readingLevel', value)} options={toSelectOptions(['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'])} />
            <SelectField label="Subject" value={settings.subjectContext} onChange={(value) => updateSetting('subjectContext', value)} options={toSelectOptions(['AI Literacy', 'ELA', 'Math', 'Science', 'Social Studies', 'CTE', 'Computer Science', 'Advisory', 'Career Readiness'])} />
            <SelectField label="Standards" value={settings.standardsTarget} onChange={(value) => updateSetting('standardsTarget', value)} options={toSelectOptions(['None', 'ISTE', 'Common Core ELA', 'Tennessee', 'Missouri', 'Kansas', 'State standards'])} />
            <SelectField label="Time" value={settings.timeAvailable} onChange={(value) => updateSetting('timeAvailable', value)} options={toSelectOptions(['30 min', '45 min', '60 min', '90 min', '3-day mini-unit', '5-day unit'])} />
            <SelectField label="Format" value={settings.classFormat} onChange={(value) => updateSetting('classFormat', value)} options={toSelectOptions(['Whole class', 'Small group', 'Individual', 'Station rotation', 'Online/asynchronous'])} />
          </FieldGrid>
        </Panel>

        <Panel title="Set Student AI Access" icon={Sparkles}>
          <SegmentedOptions value={settings.studentAiAccessLevel} onChange={(value) => updateSetting('studentAiAccessLevel', value)} options={studentAccessOptions} />
          <p className="mt-3 text-sm text-slate-600">{studentAccessNotes[settings.studentAiAccessLevel]}</p>
        </Panel>

        <Panel title="Choose Deliverables" icon={ClipboardList}>
          <CardOptions value={settings.packPreset} onChange={(value) => updateSetting('packPreset', value)} options={packOptions} detailKey="deliverables" />
          <ChipList items={(selectedPack.deliverables ?? []).map(labelFromValue)} />
        </Panel>

        <Panel title="Add Source and Policy Context" icon={Upload}>
          <div className="mb-4 flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>Use local standards, policies, or constraints to make the generated package more review-ready.</p>
          </div>
          <SelectField label="Policy output" value={settings.policyOutput} onChange={(value) => updateSetting('policyOutput', value)} options={toSelectOptions(policyOptions)} />
          <TextAreaField
            label="Source notes"
            value={sourceNotes}
            onChange={setSourceNotes}
            placeholder="Paste standards, school AI policy language, local requirements, employer skill notes, or constraints you want reflected in the generated package."
          />
        </Panel>
      </section>
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

  return (
    <BuilderFrame
      eyebrow="College Course"
      title={courseWorkflow.title}
      subtitle={courseWorkflow.subtitle}
      buttonLabel="Build Course"
      isLoading={isLoading}
      onBuild={buildPrompt}
      summary={[
        ['Course', settings.courseTitle],
        ['Format', `${settings.creditHours} credits, ${settings.termLength}, ${settings.deliveryFormat}`],
        ['Learners', settings.targetLearnerProfile],
        ['Output', selectedOutput.label],
      ]}
    >
      <section className="grid gap-5 lg:grid-cols-2">
        <Panel title="Course Basics" icon={GraduationCap}>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase text-slate-600">Course title</span>
            <input
              value={settings.courseTitle}
              onChange={(event) => updateSetting('courseTitle', event.target.value)}
              className="h-11 w-full rounded-md border border-slate-300 px-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <FieldGrid>
            <SelectField label="Level" value={settings.courseLevel} onChange={(value) => updateSetting('courseLevel', value)} options={fieldSelectOptions(courseWorkflow, 'course-basics', 'courseLevel')} />
            <SelectField label="Credits" value={settings.creditHours} onChange={(value) => updateSetting('creditHours', value)} options={fieldSelectOptions(courseWorkflow, 'course-basics', 'creditHours')} />
            <SelectField label="Term" value={settings.termLength} onChange={(value) => updateSetting('termLength', value)} options={fieldSelectOptions(courseWorkflow, 'course-basics', 'termLength')} />
            <SelectField label="Delivery" value={settings.deliveryFormat} onChange={(value) => updateSetting('deliveryFormat', value)} options={fieldSelectOptions(courseWorkflow, 'course-basics', 'deliveryFormat')} />
            <SelectField label="Learners" value={settings.targetLearnerProfile} onChange={(value) => updateSetting('targetLearnerProfile', value)} options={fieldSelectOptions(courseWorkflow, 'course-basics', 'targetLearnerProfile')} />
          </FieldGrid>
        </Panel>

        <Panel title="Competency Focus" icon={Layers3}>
          <ChipList items={['AI foundations', 'Python', 'Data analysis', 'Machine learning', 'Generative AI', 'Responsible AI', 'Career readiness']} />
          <FieldGrid>
            <SelectField label="Math" value={settings.mathIntensity} onChange={(value) => updateSetting('mathIntensity', value)} options={fieldSelectOptions(courseWorkflow, 'competency-focus', 'mathIntensity')} />
            <SelectField label="Coding" value={settings.codingIntensity} onChange={(value) => updateSetting('codingIntensity', value)} options={fieldSelectOptions(courseWorkflow, 'competency-focus', 'codingIntensity')} />
            <SelectField label="Data" value={settings.dataRequirement} onChange={(value) => updateSetting('dataRequirement', value)} options={fieldSelectOptions(courseWorkflow, 'competency-focus', 'dataRequirement')} />
          </FieldGrid>
        </Panel>

        <Panel title="Applied Learning and Assessment" icon={ClipboardList}>
          <FieldGrid>
            <SelectField label="Labs" value={settings.labCadence} onChange={(value) => updateSetting('labCadence', value)} options={fieldSelectOptions(courseWorkflow, 'applied-learning', 'labCadence')} />
            <SelectField label="Final project" value={settings.finalProjectType} onChange={(value) => updateSetting('finalProjectType', value)} options={fieldSelectOptions(courseWorkflow, 'applied-learning', 'finalProjectType')} />
            <SelectField label="Assessment" value={settings.assessmentModel} onChange={(value) => updateSetting('assessmentModel', value)} options={fieldSelectOptions(courseWorkflow, 'assessment-cqi', 'assessmentModel')} />
          </FieldGrid>
          <ChipList items={['Coding labs', 'Data notebooks', 'Ethics cases', 'Portfolio artifacts', 'Capstone project']} />
        </Panel>

        <Panel title="Course Package Outputs" icon={CheckCircle2}>
          <CardOptions value={settings.outputPreset} onChange={(value) => updateSetting('outputPreset', value)} options={outputOptions} detailKey="includedOutputs" />
          <ChipList items={(selectedOutput.includedOutputs ?? []).map(labelFromValue)} />
        </Panel>

        <Panel title="Add Program Source and Policy Context" icon={Upload}>
          <div className="mb-4 flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>Use institutional notes, employer skills, or policy language to make the course package review-ready.</p>
          </div>
          <SelectField label="Policy output" value={settings.policyOutput} onChange={(value) => updateSetting('policyOutput', value)} options={toSelectOptions(policyOptions)} />
          <TextAreaField
            label="Source notes"
            value={sourceNotes}
            onChange={setSourceNotes}
            placeholder="Paste program outcomes, local workforce needs, advisory board notes, syllabus constraints, institutional policy language, or accreditation/CQI expectations."
          />
        </Panel>
      </section>
    </BuilderFrame>
  );
}

function ProductEdgeStrip() {
  return (
    <section className="mb-6 border-b border-slate-200 pb-5" aria-label="Classroom Copilot product strengths">
      <div className="grid gap-3 lg:grid-cols-4">
        {productEdges.map((edge) => (
          <div key={edge.title} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-blue-800">
              <CheckCircle2 className="h-4 w-4" />
              {edge.title}
            </div>
            <p className="text-sm leading-5 text-slate-600">{edge.text}</p>
          </div>
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
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  isLoading: boolean;
  onBuild: () => void;
  summary: Array<[string, string]>;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
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
            <strong className="mt-1 block truncate text-sm">{value}</strong>
          </div>
        ))}
      </div>

      {children}
    </section>
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: OptionItem[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase text-slate-600">{label}</span>
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
  emptyTitle,
  onImprove,
}: {
  isLoading: boolean;
  content: string;
  emptyTitle: string;
  onImprove: (prompt: string) => void;
}) {
  const [exportStatus, setExportStatus] = useState('');
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

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-bold">Generated Package</h3>
          <p className="text-sm text-slate-600">Review the generated materials, then export them for teaching, sharing, or presentation.</p>
        </div>
        <div className="sticky top-[7.75rem] z-10 -mx-1 flex gap-2 overflow-x-auto bg-white/95 px-1 py-2 backdrop-blur lg:static lg:z-auto lg:flex-wrap lg:overflow-visible lg:bg-transparent lg:p-0">
          <ExportButton
            icon={FileText}
            label="Polished HTML"
            disabled={!hasContent || isLoading}
            onClick={() => runExport('Polished HTML downloaded.', () => exportToHtml(content, filename))}
          />
          <ExportButton
            icon={Printer}
            label="Print / PDF"
            disabled={!hasContent || isLoading}
            onClick={() => runExport('Print view opened.', () => printFormattedDocument(content, filename))}
          />
          <ExportButton
            icon={Presentation}
            label="PPT"
            disabled={!hasContent || isLoading}
            onClick={() => runExport('PowerPoint downloaded.', () => exportToPptx(content, filename))}
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
            label="Improve Readiness"
            disabled={!hasContent || isLoading}
            onClick={improveReadiness}
          />
        </div>
      </div>
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

export default App;
