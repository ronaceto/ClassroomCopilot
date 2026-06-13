# Build College Course Workflow

Purpose: add a higher-ed workflow that helps faculty and program coordinators create syllabus-ready AI Technology courses with outcomes, weekly modules, labs, assignments, assessments, ethics policy, delivery-format notes, and applied projects.

Primary user: community-college AI Technology faculty member, program coordinator, department chair, or curriculum developer.

Primary promise: turn a course idea into a faculty-review-ready course package aligned to applied AI Technology instruction.

## First Screen

Recommended heading:

`Build an AI Technology College Course`

Recommended supporting copy:

`Generate syllabus-ready course materials, weekly modules, applied labs, assessments, and responsible AI policies for community-college learners.`

Primary action:

`Build Course`

Secondary actions:

- `Start from Sample Course`
- `Preview Course Package`
- `Open Saved Courses`

## Workflow Shape

Use a focused builder with five sections. Keep the course builder separate from generic chat. Chat should appear after generation as a refinement tool.

### 1. Course Basics

Goal: define the course identity and institutional context.

Controls:

- Course title
- Course level
- Credit hours
- Term length
- Delivery format
- Target learner profile

Course level options:

- Introductory
- Intermediate
- Advanced
- Bridge / noncredit
- Workforce certificate

Credit hour options:

- 1
- 2
- 3
- 4
- Custom

Term length options:

- 7 weeks
- 10 weeks
- 15 weeks
- Custom

Delivery format options:

- Face-to-face
- Online
- Hybrid
- HyFlex

Target learner profile options:

- No coding background
- Beginner Python
- Intermediate programming
- Mixed background
- Working adult learners
- Dual enrollment / early college

Default:

- Course title: Introduction to Artificial Intelligence Technology
- Course level: Introductory
- Credit hours: 3
- Term length: 15 weeks
- Delivery format: Hybrid
- Target learner profile: Mixed background

### 2. Competency Focus

Goal: choose the skills and technical areas the course should cover.

Controls:

- Competency areas
- Tool/platform preferences
- Math intensity
- Coding intensity
- Data requirements

Competency area options:

- AI literacy and foundations
- Python fundamentals for AI
- Data literacy and analysis
- Data cleaning and visualization
- Machine learning concepts
- Supervised and unsupervised learning
- Model evaluation
- Neural network foundations
- Generative AI tools and prompting
- AI APIs and frameworks
- Responsible, ethical, and legal AI use
- Privacy, data governance, and FERPA-aware handling
- Applied AI project design
- Communication of technical findings
- Career readiness and portfolio development

Tool/platform options:

- Python
- Jupyter Notebook
- Google Colab
- pandas
- scikit-learn
- OpenAI / generative AI APIs
- Hugging Face
- GitHub
- LMS-friendly / no local install
- Custom

Math intensity:

- Minimal math
- Conceptual math
- Applied formulas
- Moderate quantitative work

Coding intensity:

- Low-code
- Beginner Python
- Python every week
- Project-heavy programming

Data requirement:

- No external datasets
- Small provided datasets
- Public datasets
- Student-collected data
- Employer/community datasets

### 3. Applied Learning Design

Goal: determine how students will practice and demonstrate skill.

Controls:

- Lab cadence
- Assignment types
- Final project type
- Collaboration model
- Portfolio requirement

Lab cadence options:

- Weekly lab
- Every other week
- Module-based labs
- Final project only

Assignment type options:

- Coding labs
- Data analysis notebooks
- Reflection posts
- AI ethics case studies
- Tool comparison activities
- Quizzes
- Practical exams
- Portfolio artifacts
- Capstone project

Final project options:

- AI portfolio
- Applied data project
- ML model evaluation project
- Generative AI tool prototype
- Responsible AI case study
- Employer/community scenario

Collaboration model options:

- Individual
- Pairs
- Small teams
- Mixed individual and team work

Portfolio requirement options:

- None
- Optional
- Required final portfolio
- Portfolio checkpoints throughout term

### 4. Assessment and CQI

Goal: produce fair assessment artifacts and program-improvement documentation starters.

Controls:

- Assessment model
- Outcome assessment evidence
- Rubric style
- CQI documentation

Assessment model options:

- Labs plus quizzes
- Labs plus portfolio
- Projects plus reflection
- Practical exams plus capstone
- Balanced model

Outcome evidence options:

- Lab submissions
- Quizzes/tests
- Final project
- Portfolio
- Presentation
- Reflection
- Practical demonstration

Rubric style options:

- Basic checklist
- Four-level rubric
- Competency-based rubric
- Workforce skill rubric

CQI documentation options:

- None
- Course-level assessment notes
- Program-level outcome evidence
- Improvement action plan
- Advisory-board feedback note

Default:

- Assessment model: Balanced model
- Outcome evidence: labs, final project, portfolio/reflection
- Rubric style: Competency-based rubric
- CQI documentation: Course-level assessment notes

### 5. Course Package Outputs

Goal: choose what the system generates.

Output package presets:

- Syllabus Draft
- Full Course Package
- Lab-Ready Course
- Online/HyFlex Course Package
- Program Coordinator Packet

Preset contents:

- Syllabus Draft:
  - Course description
  - Course outcomes
  - Weekly schedule
  - Assessment weights
  - Course policies

- Full Course Package:
  - Course description
  - Course outcomes
  - Weekly schedule
  - Module descriptions
  - Lab sequence
  - Assignment sequence
  - Assessment plan
  - Rubric
  - Final project
  - Responsible AI policy
  - Student support notes

- Lab-Ready Course:
  - Weekly lab plan
  - Lab objectives
  - Setup notes
  - Lab checkpoints
  - Lab rubrics
  - Troubleshooting notes

- Online/HyFlex Course Package:
  - Weekly schedule
  - Asynchronous activities
  - Synchronous session plan
  - Discussion prompts
  - Online assessment notes
  - Accessibility notes

- Program Coordinator Packet:
  - Course outcomes
  - Course-to-program alignment starter
  - Assessment evidence plan
  - CQI notes
  - Advisory-board discussion questions
  - Workforce skill narrative

Default:

- Full Course Package

## Generated Course View

After generation, show the course package in tabs:

- Overview
- Outcomes
- Weekly Modules
- Labs
- Assignments
- Assessments
- Syllabus
- CQI / Program Notes

Refinement actions:

- Make more hands-on
- Reduce coding load
- Increase Python practice
- Add HyFlex notes
- Add workforce alignment
- Add ethics case studies
- Add beginner support
- Add advanced extension
- Convert to 7-week course
- Export

## Required Output Structure

Every generated full course package should include:

- Course title
- Draft catalog description
- Course level, credits, term length, and delivery format
- Target learner assumptions
- Course learning outcomes
- Competency map
- Weekly module schedule
- Weekly topics and objectives
- Weekly lab or applied activity
- Assignment sequence
- Assessment plan and weights
- Final project/capstone
- Responsible and ethical AI policy
- Tools/platforms
- Accessibility and student support notes
- FERPA/privacy/data-use cautions
- Instructor preparation notes
- CQI/assessment evidence notes
- Draft syllabus language

## Example Default Course

Course title: Introduction to Artificial Intelligence Technology

Default course profile:

- Level: introductory
- Credits: 3
- Term: 15 weeks
- Format: hybrid
- Learners: mixed background, beginner Python support needed
- Competencies: AI foundations, Python, data analysis, machine learning concepts, generative AI tools, responsible AI, applied projects, career readiness
- Lab cadence: weekly lab
- Final project: applied AI portfolio project
- Assessment: labs, quizzes, portfolio, final project, reflection

## Quality Rules

The generator should:

- Label outputs as draft materials for faculty and department review.
- Avoid claiming institutional approval or accreditation compliance.
- Include practical applied learning, not only lecture topics.
- Include multiple delivery-format notes when online, hybrid, or HyFlex is selected.
- Include FERPA-aware cautions around student records, grades, attendance, and student data.
- Include responsible AI, privacy, bias, verification, and academic integrity language.
- Include beginner supports when the learner profile includes no coding or mixed background.
- Include workforce skill language where program alignment or career readiness is selected.

## Empty and Error States

No course title:

`Add a course title or start from a sample AI Technology course.`

No competency areas:

`Choose at least one competency area so the course has a clear technical focus.`

Generation failed:

`I could not build this course package yet. Check the app configuration or try a smaller output package.`

Avoid exposing raw implementation errors or environment variable names.

## Mobile Layout

Mobile should use a stepper:

1. Basics
2. Competencies
3. Applied Learning
4. Assessment
5. Outputs
6. Review

## Implementation Mapping

Generation request object:

- `mode`
- `courseTitle`
- `courseLevel`
- `creditHours`
- `termLength`
- `deliveryFormat`
- `targetLearnerProfile`
- `competencyAreas`
- `toolPlatforms`
- `mathIntensity`
- `codingIntensity`
- `dataRequirement`
- `labCadence`
- `assignmentTypes`
- `finalProjectType`
- `collaborationModel`
- `portfolioRequirement`
- `assessmentModel`
- `outcomeEvidence`
- `rubricStyle`
- `cqiDocumentation`
- `outputPreset`
- `includedOutputs`
- `outputDepth`

## Product Priority

Build in this order:

1. Course Builder form and review summary
2. Static sample output for default course
3. Generation request object
4. Full course generation prompt
5. Generated course package tabs
6. Refinement actions
7. Export to DOCX/PDF/Google Docs
8. Saved course packages
