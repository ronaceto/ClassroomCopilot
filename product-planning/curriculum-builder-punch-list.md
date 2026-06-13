# AI Curriculum Builder Punch List

## Phase 1: Source Foundation

- Confirm latest book source and keep one verified local copy.
- Extract full text and page-level text.
- Create a book structure draft from the table of contents.
- Identify missing source inputs: Classroom Copilot repo, teacher notes, worksheets, slides, standards files.

## Phase 2: Curriculum Map

- Convert parts into curriculum units.
- Convert chapters into lesson modules.
- For each chapter, capture:
  - Big idea
  - Learning objectives
  - Vocabulary
  - Essential questions
  - Student misconceptions
  - Student activities
  - Formative checks
  - Assessment options
  - Responsible AI guardrails
  - Teacher notes

## Phase 3: Product Redirection

- Replace generic "AI teaching assistant" positioning with "AI curriculum builder."
- Make "Build Curriculum Pack" the primary workflow.
- Use book chapters/modules as the source of truth.
- Keep chat as refinement, not the main product shape.

## Phase 4: App Implementation

- Locate or add the Classroom Copilot app under `C:\Dev\classroom-copilot`.
- Fix the live generation blocker: `OPENAI_MAX_TOKENS is not defined`.
- Add a curriculum source model.
- Add lesson-pack generation from selected book modules.
- Add exportable deliverables.

## Phase 5: QA and Demo Readiness

- Verify end-to-end generation.
- Check generated content against source chapter intent.
- Test desktop, tablet, and mobile layouts.
- Add friendly error states.
- Create a school/admin demo path.
