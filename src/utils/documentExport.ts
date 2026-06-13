export type CopyTemplate =
  | 'teacher_lesson_deck'
  | 'student_activity_deck'
  | 'college_syllabus_packet'
  | 'program_proposal_deck'
  | 'advisory_board_deck';

const templateLabels: Record<CopyTemplate, string> = {
  teacher_lesson_deck: 'Teacher Lesson Deck',
  student_activity_deck: 'Student Activity Deck',
  college_syllabus_packet: 'College Syllabus Packet',
  program_proposal_deck: 'Program Proposal Deck',
  advisory_board_deck: 'Advisory Board Deck',
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

export const exportToHtml = (content: string, filename: string, template: CopyTemplate = 'teacher_lesson_deck'): void => {
  downloadTextFile(buildHtmlDocument(content, filename, template), `${filename}.html`, 'text/html;charset=utf-8');
};

export const printFormattedDocument = (content: string, title: string, template: CopyTemplate = 'teacher_lesson_deck'): void => {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer');

  if (!printWindow) {
    downloadTextFile(buildHtmlDocument(content, title, template), `${title}.html`, 'text/html;charset=utf-8');
    return;
  }

  printWindow.document.write(buildHtmlDocument(content, title, template));
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
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

  await pptx.writeFile({ fileName: `${filename}.pptx` });
};

const downloadTextFile = (content: string, filename: string, type: string): void => {
  const blob = new Blob([content], { type });
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
      background: #f8fafc;
    }
    main {
      max-width: 880px;
      margin: 0 auto;
      background: white;
      min-height: 100vh;
      padding: 48px;
    }
    .brand {
      border-bottom: 3px solid #1d4ed8;
      margin-bottom: 32px;
      padding-bottom: 18px;
    }
    .eyebrow {
      color: #1d4ed8;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    h1, h2, h3 {
      line-height: 1.15;
      margin: 1.5em 0 .5em;
    }
    h1 {
      font-size: 34px;
      margin-top: 8px;
    }
    h2 {
      border-top: 1px solid #e2e8f0;
      color: #1e3a8a;
      font-size: 24px;
      padding-top: 22px;
    }
    h3 {
      font-size: 18px;
    }
    p, li {
      font-size: 15px;
    }
    ul, ol {
      padding-left: 24px;
    }
    strong {
      color: #020617;
    }
    @media print {
      body {
        background: white;
      }
      main {
        max-width: none;
        min-height: 0;
        padding: 0;
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
      <p><strong>${escapeHtml(templateLabels[template])}</strong></p>
    </section>
    ${markdownToHtml(content)}
  </main>
</body>
</html>`;

const markdownToHtml = (content: string): string => {
  const lines = content.split(/\r?\n/);
  const html: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      return;
    }

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
  const title = template === 'advisory_board_deck' ? 'Advisory Facilitation Notes' : template === 'program_proposal_deck' ? 'Proposal Review Notes' : 'Teacher Facilitation Notes';
  const notes =
    template === 'advisory_board_deck'
      ? ['Confirm employer skill needs.', 'Capture advisory feedback and action items.', 'Identify internship, project, and tool recommendations.', 'Document curriculum updates for CQI follow-up.']
      : template === 'program_proposal_deck'
        ? ['Review rationale, outcomes, staffing, resources, and lab/tool needs.', 'Check course sequence and credential milestones.', 'Validate CQI evidence and advisory input.', 'Use as a draft for department and institutional review.']
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
