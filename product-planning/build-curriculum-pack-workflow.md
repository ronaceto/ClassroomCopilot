# Build Curriculum Pack Workflow

Purpose: redesign Classroom Copilot around a curriculum-builder workflow powered by the `AI for Students` curriculum map.

Primary user: teacher, curriculum lead, counselor, or school leader preparing classroom-ready AI literacy materials.

Primary promise: choose a book-based module, set classroom constraints, and generate a ready-to-teach curriculum pack.

## First Screen

The first screen should be the builder itself, not a generic chat welcome.

Recommended heading:

`Build an AI Literacy Curriculum Pack`

Recommended supporting copy:

`Start from the AI for Students curriculum, choose your classroom context, and generate teacher-ready materials.`

Primary action:

`Build Pack`

Secondary actions:

- `Preview Module`
- `Use Last Settings`
- `Open Generated Packs`

## Workflow Shape

Use one continuous builder with four compact sections. Avoid sending the teacher through a separate wizard unless the mobile layout needs step-by-step panels.

### 1. Choose Curriculum Source

Goal: pick what the lesson is about.

Controls:

- Unit picker
- Module picker
- Module preview

Unit picker should show:

- Unit title
- Number of modules
- One-line goal

Module picker should show:

- Module title
- Source chapter/page
- Essential question
- Short chips for vocabulary, activity, assessment, and guardrails

Default:

- If no previous state exists, default to Unit 1, Module 1.
- If previous state exists, restore the last selected unit/module.

Module preview should include:

- Essential question
- Learning objectives
- Vocabulary
- Core activity
- Assessment
- AI-use guardrails

### 2. Set Classroom Context

Goal: adapt the module for a real classroom.

Controls:

- Grade level: 6, 7, 8, 9, 10, 11, 12, College intro, Custom
- Reading level: defaults to selected grade, adjustable from grade 5 to grade 12
- Subject/context: AI Literacy, ELA, Math, Science, Social Studies, CTE, Computer Science, Advisory, Library/Media, Career Readiness, Custom
- Standards target: None, ISTE, Common Core ELA, State standards, Tennessee, Missouri, Kansas, Custom
- Time available: 30 min, 45 min, 60 min, 90 min, 3-day mini-unit, 5-day unit
- Class format: whole class, small group, individual, station rotation, online/asynchronous

Defaults:

- Grade level: 8-12 selector should remember prior value; initial app default can be Grade 10.
- Subject/context: AI Literacy.
- Standards target: ISTE plus selected state when configured.
- Time available: 45-60 min.
- Class format: whole class.

### 3. Set Student AI Access Level

Goal: make the generated activity safe for the actual school environment.

Use a segmented control with four options:

- No student AI
- Teacher-demo AI
- Supervised student AI
- Independent student AI

Definitions:

- No student AI: teacher uses the book content; students discuss, write, sort prompts, or analyze sample outputs without touching an AI tool.
- Teacher-demo AI: teacher projects or demonstrates AI; students observe, critique, and reflect.
- Supervised student AI: students use AI in class with teacher-approved prompts, visible guardrails, and structured reflection.
- Independent student AI: students may use AI individually within teacher, family, school, and platform rules.

The selected access level must change the generated materials:

- No student AI should generate printable/screen-free alternatives.
- Teacher-demo AI should include projected prompt scripts and discussion pauses.
- Supervised student AI should include student prompt cards, privacy warnings, and teacher monitoring notes.
- Independent student AI should include disclosure language, self-checklists, and verification requirements.

Default:

- Teacher-demo AI.

### 4. Choose Deliverables

Goal: choose the output package.

Recommended deliverable types:

- Full lesson pack
- Student handout
- Guided AI activity
- No-AI alternative
- Slides outline
- Quiz / exit ticket
- Rubric / checklist
- Parent/admin summary
- 3-day mini-unit
- 5-day unit

Use checkboxes for optional pack contents and a primary pack preset menu.

Pack presets:

- Quick Class Activity: student handout, guided activity, exit ticket
- Full Lesson Pack: teacher plan, student handout, guided activity, formative check, exit ticket, rubric/checklist
- Admin-Ready Curriculum Sample: teacher plan, standards alignment, parent/admin summary, rubric/checklist
- No-AI Classroom Version: teacher plan, no-AI alternative, student handout, discussion questions, exit ticket
- Mini-Unit: 3-day or 5-day sequence, daily activities, assessments, reflection

Default:

- Full Lesson Pack.

## Builder Summary

Before generation, show a compact summary:

- Unit and module
- Grade/reading level
- Standards target
- Student AI access level
- Time available
- Deliverables

Primary button:

`Build Curriculum Pack`

Loading state:

`Building your curriculum pack...`

The loading state should show the selected module and deliverables, not a generic spinner alone.

## Generated Pack View

After generation, keep the teacher in the same flow.

Layout:

- Left or top: pack outline and deliverable tabs
- Main area: selected deliverable content
- Right or bottom: refinement actions

Deliverable tabs:

- Teacher Plan
- Student Handout
- AI Activity
- Assessment
- Rubric
- Summary

Refinement actions:

- Make more hands-on
- Shorten to 30 minutes
- Add ELL supports
- Add IEP/504 accommodations
- Add extension challenge
- Make no-AI version
- Align to different standards
- Export

Chat role:

Chat should appear after generation as `Refine this pack`, not as the main starting point.

## Required Output Structure

Every generated full lesson pack should include:

- Title
- Source unit/module/chapter
- Grade and time
- Essential question
- Learning objectives
- Vocabulary
- Materials
- Teacher preparation
- Lesson sequence with timing
- Guided AI activity or no-AI alternative
- Student directions
- Differentiation supports
- AI-use guardrails
- Formative check
- Exit ticket
- Rubric/checklist
- Teacher notes
- Export metadata

## Safety and Quality Rules

The generator should always:

- Preserve the selected module's core learning purpose.
- Include student-facing AI-use guardrails.
- Avoid telling students to enter personal/private information.
- Include verification requirements when facts, research, history, science, health, or careers are involved.
- Include no-AI alternatives when access level is `no_student_ai`.
- Include disclosure language when student AI use is allowed.
- Keep student thinking, evidence, and reflection central.

## Empty and Error States

No module selected:

`Choose a unit and module to build from the AI for Students curriculum.`

Generation failed:

`I could not build this pack yet. Check the app configuration or try a smaller deliverable.`

Avoid exposing raw implementation errors such as missing environment variable names to teachers.

No student AI selected:

`This pack will use teacher-led examples and printable student activities without requiring student AI access.`

## Mobile Layout

Mobile should become a stepper:

1. Module
2. Classroom
3. AI Access
4. Deliverables
5. Review

Keep the prompt/composer out of the first mobile screen. The builder choices should own the screen.

## Implementation Mapping

Use `curriculum-map/data/modules.json` for:

- Unit list
- Module list
- Module preview
- Essential question
- Objectives
- Vocabulary
- Activity seed
- Assessment seed
- Guardrails

The builder should combine module data with teacher selections into a generation request object:

- `unitId`
- `moduleId`
- `gradeLevel`
- `readingLevel`
- `subjectContext`
- `standardsTarget`
- `timeAvailable`
- `classFormat`
- `studentAiAccessLevel`
- `packPreset`
- `deliverables`
- `differentiation`
- `outputDepth`

## Product Priority

Build in this order:

1. Static builder form powered by `modules.json`
2. Module preview
3. Generation request object
4. Full lesson pack prompt/template
5. Generated pack view with tabs
6. Refinement actions
7. Export
8. Saved generated packs
