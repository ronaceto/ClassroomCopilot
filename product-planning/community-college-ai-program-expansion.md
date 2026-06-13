# Community College AI Program Expansion

Purpose: expand Classroom Copilot so it can support a community-college Artificial Intelligence Technology faculty/program coordinator role, using the Southwest Tennessee Community College job description as the initial role model.

## Strategic Direction

Classroom Copilot should support two connected modes:

1. **AI Literacy Curriculum Builder**
   - Current direction.
   - Teacher-facing, book-based, grades 8-12/adult learner adaptable.
   - Generates lesson packs, student activities, assessments, rubrics, and responsible AI guardrails.

2. **AI Program Builder**
   - New expansion.
   - Faculty/program-coordinator facing.
   - Helps design, document, assess, and continuously improve a community-college AI Technology program.

This creates a strong bridge between the `AI for Students` book and the faculty role: the site becomes both a curriculum generator and a program-development assistant.

## Role Needs From Job Description

The position requires support for:

- Teaching foundational and advanced AI topics.
- Python programming.
- Data analysis.
- Machine learning.
- AI tools and frameworks.
- Neural networks.
- Ethical and responsible AI.
- Face-to-face, online, hybrid, and HyFlex delivery.
- Syllabi, instructional materials, lab exercises, assignments, assessments.
- Hands-on, applied, project-based learning.
- Attendance, grades, academic documentation, FERPA-aware practice.
- Academic advising and student mentoring.
- Course- and program-level assessment.
- Continuous Quality Improvement (CQI).
- Program coordination.
- Curriculum review and improvement.
- Certificates and degree pathways.
- Advisory board coordination.
- Industry feedback incorporation.
- Workforce alignment.
- Experiential learning and internships.
- Program outreach, promotion, recruitment, and enrollment.

## Proposed Product Modes

### Mode 1: Build Curriculum Pack

Current K-12/adult-learning workflow powered by the book curriculum map.

Best for:

- Single lesson
- Student handout
- Prompt activity
- Responsible AI activity
- Exit ticket
- Rubric
- Parent/admin summary

### Mode 2: Build College Course

New workflow for faculty designing a full course.

Inputs:

- Course title
- Course level: introductory, intermediate, advanced
- Credit hours
- Delivery format: face-to-face, online, hybrid, HyFlex
- Term length: 7-week, 10-week, 15-week, custom
- Student background: no coding, beginner Python, intermediate programming, mixed
- Topic emphasis:
  - Python programming
  - Data analysis
  - Machine learning
  - Generative AI tools
  - Neural networks
  - AI ethics
  - Applied AI projects
- Assessment model:
  - Labs
  - Quizzes
  - Projects
  - Portfolio
  - Capstone
  - Practical exams

Outputs:

- Course description
- Course learning outcomes
- Weekly schedule
- Module descriptions
- Lab sequence
- Assignment sequence
- Assessment plan
- Final project/capstone
- Required tools/platforms
- Accessibility and student support notes
- AI ethics and responsible-use policy
- Syllabus draft

### Mode 3: Build Applied Lab

New workflow for hands-on technical learning.

Inputs:

- Topic: Python, data analysis, ML, neural networks, generative AI, responsible AI
- Skill level
- Lab length
- Tool/platform
- Data availability
- Student deliverable
- Group or individual

Outputs:

- Lab objective
- Prerequisites
- Setup instructions
- Step-by-step lab
- Checkpoints
- Reflection questions
- Troubleshooting notes
- Rubric
- Extension challenge
- FERPA/privacy caution when using data

### Mode 4: Build Program Map

New workflow for program coordination and early-stage curriculum development.

Inputs:

- Certificate or degree pathway
- Number of courses
- Target student profile
- Workforce goal
- Required technical competencies
- Advisory-board feedback
- Accreditation or institutional requirements

Outputs:

- Program outcomes
- Course sequence
- Competency map
- Course-to-program outcome alignment
- Assessment map
- Suggested certificates/pathways
- Employer-facing skill narrative
- Advisory board discussion guide
- CQI documentation starter

### Mode 5: Build Assessment / CQI Packet

New workflow for assessment and continuous improvement.

Inputs:

- Course or program
- Learning outcomes
- Assignment or artifact
- Performance criteria
- Term
- Evidence collected
- Improvement concern

Outputs:

- Outcome assessment plan
- Rubric
- Evidence summary template
- CQI reflection
- Action plan
- Follow-up measure
- Advisory-board feedback incorporation note
- Program review documentation draft

### Mode 6: Build Workforce / Advisory Board Packet

New workflow for external alignment.

Inputs:

- Industry sector
- Target roles
- Skills requested by employers
- Local workforce needs
- Program/course list
- Advisory meeting goal

Outputs:

- Advisory board agenda
- Industry feedback questions
- Skill-gap analysis template
- Employer outreach email
- Internship/project partner brief
- Program promotion talking points
- Enrollment/recruitment one-pager

## Site Navigation Recommendation

The app should not become a sprawling dashboard. Use a mode switch at the top:

- Curriculum Pack
- College Course
- Applied Lab
- Program Map
- Assessment/CQI
- Advisory/Workforce

Each mode uses the same pattern:

1. Choose source or goal
2. Set learner/program context
3. Choose output package
4. Generate
5. Refine/export

## Data Model Expansion

Add structured data for higher-ed AI program work:

- `programOutcomes`
- `courseOutcomes`
- `competencies`
- `courseModules`
- `labTemplates`
- `assessmentMethods`
- `deliveryFormats`
- `toolsAndFrameworks`
- `ethicsGuardrails`
- `cqiArtifacts`
- `advisoryBoardArtifacts`
- `workforceAlignmentArtifacts`

## Suggested AI Technology Program Competency Areas

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

## Competitive Edge

Most teacher AI tools generate lessons. This expansion would help faculty and program coordinators generate:

- A full AI program structure
- Course and module maps
- Labs and applied projects
- Outcomes and assessment documentation
- CQI artifacts
- Advisory board materials
- Workforce alignment evidence

That makes Classroom Copilot useful for someone building an actual AI Technology program, not only teaching isolated lessons.

## First Build Recommendation

Start with **Build College Course** as the first higher-ed workflow because it directly supports the job's core responsibilities:

- teaching
- syllabi
- course materials
- labs
- assignments
- assessments
- delivery formats
- applied learning

Then add:

1. Applied Lab Builder
2. Assessment/CQI Packet Builder
3. Program Map Builder
4. Advisory/Workforce Packet Builder

## Minimum Viable Higher-Ed Feature Set

For the first release, add:

- Mode selector: Curriculum Pack vs College Course
- Course Builder form
- AI Technology topic presets
- Delivery format selector
- Student background selector
- Course outcomes generator
- Weekly module planner
- Lab/assignment generator
- Assessment/rubric generator
- Syllabus draft output

## Example First Workflow: Build College Course

Inputs:

- Course title: Introduction to Artificial Intelligence Technology
- Level: introductory
- Term length: 15 weeks
- Delivery: hybrid or HyFlex
- Student background: beginner Python/mixed
- Emphasis: Python, data analysis, generative AI, responsible AI, applied projects
- Final deliverable: student portfolio project

Generated outputs:

- Catalog-style course description
- 6-8 course learning outcomes
- Weekly schedule
- Lab sequence
- Major assignments
- Final project
- Assessment weights
- AI ethics policy
- Student support notes
- Syllabus-ready draft

## Product Guardrails

- Do not invent official institutional policy.
- Label generated syllabi, program maps, and CQI artifacts as drafts for faculty review.
- Include FERPA-aware cautions when dealing with student records or data.
- Include accessibility and multiple delivery-format considerations.
- Avoid claiming accreditation compliance; instead generate documentation starters aligned to common assessment/CQI practices.
- Treat advisory board and workforce materials as planning drafts requiring local review.

## Relationship to AI for Students Book

The book remains useful in this higher-ed expansion as:

- Introductory AI literacy content for beginning learners.
- Responsible AI and media literacy modules.
- Student-facing bridge material for nontechnical or mixed-background cohorts.
- Recruitment/outreach content for AI awareness workshops.
- Supplemental activities for ethics, prompting, verification, and future-of-work units.

For the college AI Technology role, the site should add more technical program-building layers on top of the book rather than forcing the book to carry the entire technical curriculum.
