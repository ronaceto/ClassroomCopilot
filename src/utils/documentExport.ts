export type CopyTemplate =
  | 'teacher_lesson_deck'
  | 'student_activity_deck'
  | 'lms_assignment_pack'
  | 'college_syllabus_packet'
  | 'program_proposal_deck'
  | 'advisory_board_deck'
  | 'program_coordinator_packet'
  | 'accreditation_readiness_package'
  | 'dean_approval_presentation'
  | 'recruitment_toolkit'
  | 'workforce_alignment_report'
  | 'cqi_management_center'
  | 'industry_partnership_center'
  | 'evidence_repository';

const templateLabels: Record<CopyTemplate, string> = {
  teacher_lesson_deck: 'Teacher Lesson Deck',
  student_activity_deck: 'Student Activity Deck',
  lms_assignment_pack: 'LMS Assignment Pack',
  college_syllabus_packet: 'College Syllabus Packet',
  program_proposal_deck: 'Program Proposal Deck',
  advisory_board_deck: 'Advisory Board Deck',
  program_coordinator_packet: 'Program Coordinator Packet',
  accreditation_readiness_package: 'Accreditation Readiness Package',
  dean_approval_presentation: 'Dean Approval Presentation',
  recruitment_toolkit: 'Recruitment Toolkit',
  workforce_alignment_report: 'Workforce Alignment Report',
  cqi_management_center: 'CQI Management Center',
  industry_partnership_center: 'Industry Partnership Center',
  evidence_repository: 'Evidence Repository',
};

export const copyToClipboard = async (content: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(content);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    const textArea = document.createElement('textarea');
    textArea.value = content;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};

export const exportToMarkdown = (content: string, filename: string): void => {
  downloadTextFile(content, `${filename}.md`, 'text/markdown;charset=utf-8');
};

export const buildLmsAssignmentCopy = (content: string): string => {
  const sections = splitIntoSections(content);
  const lmsSectionTitles = [
    'Canvas Module Overview',
    'Google Classroom Assignment Post',
    'Moodle / Schoology Activity Instructions',
    'Moodle/Schoology Activity Instructions',
    'LMS Discussion Prompt',
    'Student Checklist',
    'Submission Evidence',
    'Rubric Table',
    'Teacher Announcement',
    'AI Use Guardrails',
  ];
  const selectedSections = sections.filter((section) =>
    lmsSectionTitles.some((title) => section.title.toLowerCase().includes(title.toLowerCase())),
  );

  if (selectedSections.length > 0) {
    return [
      '# LMS Assignment Pack',
      '',
      ...selectedSections.flatMap((section) => [`## ${section.title}`, '', ...section.lines, '']),
    ].join('\n').trim();
  }

  return [
    '# LMS Assignment Pack',
    '',
    '## Assignment Post',
    'Copy the generated package below into Canvas, Google Classroom, Moodle, or Schoology. Add the due date, points, submission type, and local AI-use policy before publishing.',
    '',
    '## Student Checklist',
    '- Read the directions and success criteria.',
    '- Complete the activity and submit the required evidence.',
    '- Follow the AI-use policy and privacy guardrails.',
    '- Reflect on accuracy, evidence, bias, and responsible use.',
    '',
    '## Source Package',
    content,
  ].join('\n');
};

export const exportToHtml = (content: string, filename: string, template: CopyTemplate = 'teacher_lesson_deck'): void => {
  downloadTextFile(buildHtmlDocument(content, filename, template), `${filename}.html`, 'text/html;charset=utf-8');
};

export const printFormattedDocument = (content: string, title: string, template: CopyTemplate = 'teacher_lesson_deck'): void => {
  const html = buildHtmlDocument(content, title, template);
  const iframe = document.createElement('iframe');
  iframe.title = `${title} print preview`;
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.setAttribute('aria-hidden', 'true');

  const cleanup = () => {
    window.setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 1000);
  };

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      cleanup();
    } catch (error) {
      console.error('Print frame failed, falling back to HTML download:', error);
      cleanup();
      downloadTextFile(html, `${title}.html`, 'text/html;charset=utf-8');
    }
  };

  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument;
    if (!doc) throw new Error('Print frame document was unavailable.');
    doc.open();
    doc.write(html);
    doc.close();
  } catch (error) {
    console.error('Print frame write failed, falling back to HTML download:', error);
    cleanup();
    downloadTextFile(html, `${title}.html`, 'text/html;charset=utf-8');
  }
};

export const exportToPptx = async (content: string, filename: string, template: CopyTemplate = 'teacher_lesson_deck'): Promise<void> => {
  const pptxModule = await import('pptxgenjs');
  const PptxGenJS = pptxModule.default;
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Classroom Copilot';
  pptx.subject = templateLabels[template];
  pptx.title = filename;
  pptx.company = 'Classroom Copilot';
  pptx.theme = {
    headFontFace: 'Aptos Display',
    bodyFontFace: 'Aptos',
    lang: 'en-US',
  };

  const sections = splitIntoSections(content);
  addTitleSlide(pptx, filename, sections[0]?.title ?? 'Generated Package', template);

  sections.slice(0, 14).forEach((section) => {
    addContentSlide(pptx, section.title, section.lines, template);
  });
  addFacilitationSlide(pptx, template);

  try {
    const blob = (await pptx.write({ outputType: 'blob' })) as Blob;
    downloadBlob(blob, `${filename}.pptx`);
  } catch (error) {
    console.error('PPT blob export failed, falling back to direct writeFile:', error);
    await pptx.writeFile({ fileName: `${filename}.pptx` });
  }
};

const downloadTextFile = (content: string, filename: string, type: string): void => {
  const blob = new Blob([content], { type });
  downloadBlob(blob, filename);
};

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const buildHtmlDocument = (content: string, title = 'Classroom Copilot Generated Package', template: CopyTemplate = 'teacher_lesson_deck'): string => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color: #0f172a;
      font-family: Aptos, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.55;
    }
    body {
      margin: 0;
      background: #eef2f7;
    }
    main {
      max-width: 920px;
      margin: 28px auto;
      background: white;
      min-height: calc(100vh - 56px);
      padding: 0 52px 52px;
      border: 1px solid #dbe3ef;
      box-shadow: 0 24px 70px rgba(15, 23, 42, .12);
    }
    .brand {
      margin: 0 -52px 34px;
      padding: 42px 52px 34px;
      background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
      color: white;
    }
    .eyebrow {
      color: #bfdbfe;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .meta {
      display: inline-flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 14px;
    }
    .pill {
      border: 1px solid rgba(255, 255, 255, .28);
      border-radius: 999px;
      padding: 7px 11px;
      color: #eff6ff;
      font-size: 12px;
      font-weight: 700;
    }
    h1, h2, h3 {
      line-height: 1.15;
      margin: 1.5em 0 .5em;
    }
    h1 {
      color: white;
      font-size: 36px;
      margin-top: 8px;
      max-width: 720px;
    }
    h2 {
      border-top: 1px solid #dbe3ef;
      color: #0f172a;
      font-size: 23px;
      margin-top: 30px;
      padding-top: 24px;
    }
    h3 {
      color: #1e3a8a;
      font-size: 18px;
    }
    p, li {
      font-size: 15px;
    }
    p {
      margin: 0 0 12px;
    }
    ul, ol {
      padding-left: 24px;
    }
    li {
      margin-bottom: 6px;
    }
    strong {
      color: #020617;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0 22px;
      font-size: 14px;
    }
    th, td {
      border: 1px solid #dbe3ef;
      padding: 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f1f5f9;
      color: #0f172a;
    }
    .review-note {
      margin: 28px 0;
      border-left: 4px solid #1d4ed8;
      background: #eff6ff;
      padding: 14px 16px;
      color: #1e3a8a;
      font-size: 14px;
      font-weight: 700;
    }
    @media print {
      body {
        background: white;
      }
      main {
        max-width: none;
        min-height: 0;
        margin: 0;
        border: 0;
        box-shadow: none;
        padding: 0 28px 28px;
      }
      .brand {
        margin: 0 -28px 28px;
        padding: 28px;
      }
      h2 {
        break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <main>
    <section class="brand">
      <div class="eyebrow">Classroom Copilot</div>
      <h1>${escapeHtml(title)}</h1>
      <div class="meta">
        <span class="pill">${escapeHtml(templateLabels[template])}</span>
        <span class="pill">Draft for educator review</span>
        <span class="pill">${new Date().toLocaleDateString()}</span>
      </div>
    </section>
    <p class="review-note">Generated as a working draft. Review local policy, standards alignment, accessibility needs, and student data privacy before sharing.</p>
    ${markdownToHtml(content)}
  </main>
</body>
</html>`;

const markdownToHtml = (content: string): string => {
  const lines = content.split(/\r?\n/);
  const html: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let tableRows: string[][] = [];

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  const closeTable = () => {
    if (tableRows.length === 0) return;
    const [header, ...rows] = tableRows;
    html.push('<table>');
    html.push(`<thead><tr>${header.map((cell) => `<th>${formatInline(cell)}</th>`).join('')}</tr></thead>`);
    html.push('<tbody>');
    rows.forEach((row) => {
      html.push(`<tr>${row.map((cell) => `<td>${formatInline(cell)}</td>`).join('')}</tr>`);
    });
    html.push('</tbody></table>');
    tableRows = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      closeTable();
      return;
    }

    if (/^\|?.+\|.+\|?$/.test(trimmed)) {
      const cells = trimmed
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim());
      const separatorRow = cells.every((cell) => /^:?-{3,}:?$/.test(cell));
      if (!separatorRow && cells.length > 1) {
        closeList();
        tableRows.push(cells);
        return;
      }
    }

    closeTable();

    const heading = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${formatInline(heading[2])}</h${level}>`);
      return;
    }

    const bullet = trimmed.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      if (listType !== 'ul') {
        closeList();
        html.push('<ul>');
        listType = 'ul';
      }
      html.push(`<li>${formatInline(bullet[1])}</li>`);
      return;
    }

    const numbered = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (numbered) {
      if (listType !== 'ol') {
        closeList();
        html.push('<ol>');
        listType = 'ol';
      }
      html.push(`<li>${formatInline(numbered[1])}</li>`);
      return;
    }

    closeList();
    html.push(`<p>${formatInline(trimmed)}</p>`);
  });

  closeList();
  closeTable();
  return html.join('\n');
};

const formatInline = (text: string): string => {
  const escaped = escapeHtml(text);
  return escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

interface SlideSection {
  title: string;
  lines: string[];
}

const splitIntoSections = (content: string): SlideSection[] => {
  const sections: SlideSection[] = [];
  let current: SlideSection = { title: 'Overview', lines: [] };

  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    const heading = trimmed.match(/^#{1,3}\s+(.*)$/);

    if (heading) {
      if (current.lines.length > 0 || current.title !== 'Overview') {
        sections.push(current);
      }
      current = { title: cleanMarkdown(heading[1]), lines: [] };
      return;
    }

    if (trimmed) {
      current.lines.push(cleanMarkdown(trimmed.replace(/^[-*]\s+/, '').replace(/^\d+[.)]\s+/, '')));
    }
  });

  if (current.lines.length > 0 || current.title !== 'Overview') {
    sections.push(current);
  }

  return sections.length > 0 ? sections : [{ title: 'Generated Package', lines: content.split(/\r?\n/).filter(Boolean).slice(0, 8) }];
};

const cleanMarkdown = (value: string): string => value.replace(/\*\*/g, '').trim();

const addTitleSlide = (
  pptx: import('pptxgenjs').default,
  filename: string,
  subtitle: string,
  template: CopyTemplate,
): void => {
  const slide = pptx.addSlide();
  slide.background = { color: 'F8FAFC' };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: 'F8FAFC' }, line: { color: 'F8FAFC' } });
  slide.addText('Classroom Copilot', { x: 0.65, y: 0.55, w: 3.5, h: 0.35, fontFace: 'Aptos', fontSize: 13, bold: true, color: '1D4ED8', margin: 0 });
  slide.addText(templateLabels[template], { x: 9.2, y: 0.55, w: 3.5, h: 0.35, fontFace: 'Aptos', fontSize: 12, bold: true, color: '475569', align: 'right', margin: 0 });
  slide.addText(filename, { x: 0.65, y: 1.45, w: 11.5, h: 1.2, fontFace: 'Aptos Display', fontSize: 34, bold: true, color: '0F172A', fit: 'shrink', margin: 0 });
  slide.addText(subtitle, { x: 0.67, y: 2.85, w: 10.5, h: 0.75, fontFace: 'Aptos', fontSize: 18, color: '475569', fit: 'shrink', margin: 0 });
  slide.addShape(pptx.ShapeType.line, { x: 0.65, y: 6.55, w: 12, h: 0, line: { color: '1D4ED8', width: 2 } });
};

const addContentSlide = (
  pptx: import('pptxgenjs').default,
  title: string,
  lines: string[],
  template: CopyTemplate,
): void => {
  const slide = pptx.addSlide();
  const bullets = lines.filter(Boolean).slice(0, 7);

  slide.background = { color: 'FFFFFF' };
  slide.addText(title, { x: 0.6, y: 0.45, w: 12, h: 0.55, fontFace: 'Aptos Display', fontSize: 24, bold: true, color: '1E3A8A', fit: 'shrink', margin: 0 });
  slide.addText(templateLabels[template], { x: 9.8, y: 6.95, w: 2.8, h: 0.25, fontSize: 9, color: '64748B', align: 'right', margin: 0 });
  slide.addShape(pptx.ShapeType.line, { x: 0.6, y: 1.15, w: 12.1, h: 0, line: { color: 'BFDBFE', width: 1.5 } });

  if (bullets.length === 0) {
    slide.addText('Add speaker notes or activities here.', { x: 0.8, y: 1.65, w: 11.6, h: 0.4, fontSize: 18, color: '475569', margin: 0 });
    return;
  }

  slide.addText(
    bullets.map((line) => ({ text: line, options: { bullet: { type: 'ul' } } })),
    {
      x: 0.85,
      y: 1.55,
      w: 11.5,
      h: 5.15,
      fontFace: 'Aptos',
      fontSize: bullets.length > 5 ? 15 : 17,
      color: '0F172A',
      breakLine: false,
      fit: 'shrink',
      paraSpaceAfterPt: 10,
      margin: 0.05,
    },
  );
};

const addFacilitationSlide = (pptx: import('pptxgenjs').default, template: CopyTemplate): void => {
  const slide = pptx.addSlide();
  const platformNotes: Partial<Record<CopyTemplate, { title: string; notes: string[] }>> = {
    program_coordinator_packet: {
      title: 'Program Coordinator Launch Notes',
      notes: ['Use as a draft launch packet for chair, dean, advisory board, and workforce partner review.', 'Validate course sequence, outcome matrix, advisory structure, and CQI plan.', 'Confirm staffing, equipment, budget, and 3-year roadmap assumptions.', 'Keep evidence artifacts organized for program review and accreditation readiness.'],
    },
    accreditation_readiness_package: {
      title: 'Accreditation Review Notes',
      notes: ['Validate outcomes, assessment methods, rubric alignment, CQI cadence, and evidence collection.', 'Label every item as draft institutional-review material.', 'Attach artifacts that support annual review and program improvement.'],
    },
    dean_approval_presentation: {
      title: 'Dean Approval Notes',
      notes: ['Review labor market rationale, pathway, resources, budget assumptions, risks, and approval request.', 'Use this deck to align chair, dean, advisory board, and workforce stakeholders.', 'Replace placeholders with local enrollment and budget data before formal use.'],
    },
    recruitment_toolkit: {
      title: 'Recruitment Use Notes',
      notes: ['Adapt copy for students, parents, counselors, website pages, open house events, and social media.', 'Verify salary and career claims with local data before publishing.', 'Connect every message to pathway, employment, and student support.'],
    },
    workforce_alignment_report: {
      title: 'Workforce Alignment Notes',
      notes: ['Validate target careers, required skills, curriculum match, and employer feedback.', 'Use advisory board input to close gaps between courses and roles.', 'Keep career outcomes framed as opportunities, not guarantees.'],
    },
    cqi_management_center: {
      title: 'CQI Management Notes',
      notes: ['Track enrollment, retention, completion, placement, feedback, satisfaction, and action plans.', 'Use the dashboard to document evidence, decisions, owners, and follow-up dates.', 'Review each term and summarize annually.'],
    },
    industry_partnership_center: {
      title: 'Industry Partnership Notes',
      notes: ['Use prospect lists, invitations, guest speaker plans, internship strategy, and employer calendar together.', 'Document every partner touchpoint and resulting curriculum recommendation.', 'Prioritize partners that validate skills and provide applied learning opportunities.'],
    },
    evidence_repository: {
      title: 'Evidence Repository Notes',
      notes: ['Store course maps, outcome maps, assessment results, advisory minutes, surveys, CQI reports, accreditation evidence, and recruitment materials.', 'Use consistent naming, review dates, owners, and status labels.', 'Treat the repository as the program single source of truth.'],
    },
  };
  const platformNote = platformNotes[template];
  const title =
    platformNote
      ? platformNote.title
      : template === 'advisory_board_deck'
      ? 'Advisory Facilitation Notes'
      : template === 'program_proposal_deck'
        ? 'Proposal Review Notes'
        : template === 'lms_assignment_pack'
          ? 'LMS Publishing Notes'
          : 'Teacher Facilitation Notes';
  const notes =
    platformNote
      ? platformNote.notes
      : template === 'advisory_board_deck'
      ? ['Confirm employer skill needs.', 'Capture advisory feedback and action items.', 'Identify internship, project, and tool recommendations.', 'Document curriculum updates for CQI follow-up.']
      : template === 'program_proposal_deck'
        ? ['Review rationale, outcomes, staffing, resources, and lab/tool needs.', 'Check course sequence and credential milestones.', 'Validate CQI evidence and advisory input.', 'Use as a draft for department and institutional review.']
        : template === 'lms_assignment_pack'
          ? ['Add due dates, points, and submission settings in the LMS.', 'Paste the student checklist and rubric into the assignment description.', 'Publish AI-use policy language before students begin.', 'Keep a teacher-reviewed no-AI or supervised-AI option ready when required.']
        : ['Review AI-use guardrails before students begin.', 'Check alignment between objectives, activities, and evidence of learning.', 'Adapt examples, timing, and accessibility supports for your learners.', 'Use the exported package as a draft for teacher, faculty, or department review.'];
  slide.background = { color: 'EFF6FF' };
  slide.addText(title, { x: 0.6, y: 0.45, w: 12, h: 0.55, fontFace: 'Aptos Display', fontSize: 24, bold: true, color: '1E3A8A', fit: 'shrink', margin: 0 });
  slide.addShape(pptx.ShapeType.line, { x: 0.6, y: 1.15, w: 12.1, h: 0, line: { color: '1D4ED8', width: 2 } });
  slide.addText(
    [
      ...notes.map((note) => ({ text: note, options: { bullet: { type: 'ul' } } })),
    ],
    {
      x: 0.85,
      y: 1.65,
      w: 11.5,
      h: 4.4,
      fontFace: 'Aptos',
      fontSize: 18,
      color: '0F172A',
      paraSpaceAfterPt: 12,
      margin: 0.05,
    },
  );
};
