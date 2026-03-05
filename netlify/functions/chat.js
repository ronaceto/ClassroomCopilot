const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// System prompts
const TEACHER_SYSTEM_PROMPT = `You are "Classroom Copilot — Teacher Mode," a friendly, seasoned instructional designer. Produce ready-to-use classroom materials that are accurate, age-appropriate, and aligned with the configuration provided. Use clear sections and checklists. Prefer concrete examples over abstractions. If a standard set is selected, list exact codes when supplied; if inferring, state "inferred" and be conservative. Include differentiation as toggled (ELL, IEP/504, extension). Never fabricate citations or sources. Keep tone conversational and practical for a busy teacher. When asked for assessments, generate varied item types and include answer keys. If the user shares proprietary content, keep it in-session only.`;

const STUDENT_SYSTEM_PROMPT = `You are "Classroom Copilot — Student Mode," a supportive tutor that prioritizes learning over shortcuts. Use the configuration to tailor reading level and examples. Before giving solutions, ask whether this is a graded assessment. If yes, provide guidance, hints, and worked examples on similar problems rather than direct answers unless the teacher explicitly authorizes full solutions. Avoid bias, stereotypes, and unsafe/explicit content. Encourage metacognition: ask short check-for-understanding questions. Keep explanations concise, step-by-step, and positive without being patronizing.`;

// Generate instruction block
const generateInstructionBlock = (config) => {
  const standardsText = config.standards.type 
    ? `${config.standards.type}${config.standards.type === 'Custom' && config.standards.customText ? ' – Custom: ' + config.standards.customText : ''}`
    : 'None';

  const gradesText = Array.isArray(config.grades) ? config.grades.join(', ') : config.grades;
  const subjectsText = Array.isArray(config.subjects) ? config.subjects.join(', ') : config.subjects;

  return `[CLASSROOM SETTINGS]
Level: ${config.level}; Grades: ${gradesText}; Subjects: ${subjectsText}
Standards: ${standardsText}
Depth: ${config.outputDepth}; Reading level: ${config.readingLevel}
Differentiation: ELL=${config.differentiation.ell}, IEP/504=${config.differentiation.iep504}, Extension=${config.differentiation.extension}
Include: Objectives=${config.include.objectives}, Materials=${config.include.materials}, Timing=${config.include.timing},
         Checks/Rubrics=${config.include.checks}/${config.include.rubrics}, Citations=${config.include.citations}

[OUTPUT RULES]
- Use markdown with clear section headings.
- When generating artifacts, place them under these headings exactly if present:
  ## Lesson Plan | ## Quiz | ## Test | ## Project | ## Worksheet | ## Rubric | ## Parent Note
- Where relevant, include Bloom's verbs in objectives and a minute-by-minute sequence if Timing is on.
- For assessments, include an Answer Key.
- For rubrics, use 4 performance levels with descriptors.
- If Citations enabled and sources were provided by user in this session, cite them; never invent.`;
};

// Parse artifacts from response
const parseArtifacts = (content) => {
  const artifacts = {};
  
  // Split content by ## headings and capture everything until the next ## or end
  const sections = content.split(/(?=^## )/m);
  
  sections.forEach(section => {
    const trimmedSection = section.trim();
    if (!trimmedSection) return;
    
    // Check if this section starts with a ## heading
    const headingMatch = trimmedSection.match(/^## (.+?)$/m);
    if (headingMatch) {
      const title = headingMatch[1].toLowerCase().replace(/\s+/g, '');
      const body = trimmedSection; // Keep the entire section including the heading
      
      if (title.includes('lessonplan') || title.includes('lesson')) {
        artifacts.lessonPlan = body;
      } else if (title.includes('quiz')) {
        artifacts.quiz = body;
      } else if (title.includes('test')) {
        artifacts.test = body;
      } else if (title.includes('project')) {
        artifacts.project = body;
      } else if (title.includes('worksheet')) {
        artifacts.worksheet = body;
      } else if (title.includes('rubric')) {
        artifacts.rubric = body;
      } else if (title.includes('parent') || title.includes('note') || title.includes('parentnote')) {
        artifacts.parentNote = body;
      }
    }
  });
  
  return artifacts;
};

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    if (!OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Server configuration error',
          message: 'Missing OPENAI_API_KEY environment variable on the Netlify function.'
        })
      };
    }

    const { mode, messages, config } = JSON.parse(event.body);

    if (!mode || !messages || !config) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Construct system prompt
    const systemPrompt = mode === 'teacher' ? TEACHER_SYSTEM_PROMPT : STUDENT_SYSTEM_PROMPT;
    const instructionBlock = generateInstructionBlock(config);
    
    // Prepare messages for OpenAI
    const openaiMessages = [
      { role: 'system', content: systemPrompt + '\n\n' + instructionBlock },
      ...messages.filter(m => m.role !== 'system')
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: openaiMessages,
        max_tokens: Number.isFinite(OPENAI_MAX_TOKENS) ? OPENAI_MAX_TOKENS : 1500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error:', errorData);
      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'OpenAI API Error', 
          details: errorData,
          troubleshooting: {
            model: OPENAI_MODEL,
            suggestions: [
              'Confirm OPENAI_API_KEY is configured in Netlify site environment variables and redeploy after changes.',
              `Check whether your key has access to model "${OPENAI_MODEL}".`,
              'Try setting OPENAI_MODEL to a model your account can access (for example gpt-4o-mini).'
            ]
          }
        })
      };
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message;

    // Parse artifacts from response
    const artifacts = parseArtifacts(assistantMessage.content);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assistantMessages: [assistantMessage],
        artifacts
      })
    };

  } catch (error) {
    console.error('Chat API Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message 
      })
    };
  }
};
