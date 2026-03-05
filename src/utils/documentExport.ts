import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import jsPDF from 'jspdf';

export const exportToDocx = async (content: string, filename: string): Promise<void> => {
  try {
    const lines = content.split('\n');
    const paragraphs: Paragraph[] = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('## ')) {
        // Heading 2
        paragraphs.push(new Paragraph({
          text: trimmedLine.substring(3),
          heading: HeadingLevel.HEADING_2,
        }));
      } else if (trimmedLine.startsWith('# ')) {
        // Heading 1
        paragraphs.push(new Paragraph({
          text: trimmedLine.substring(2),
          heading: HeadingLevel.HEADING_1,
        }));
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        // Bullet point
        paragraphs.push(new Paragraph({
          text: trimmedLine.substring(2),
          bullet: {
            level: 0
          }
        }));
      } else if (trimmedLine) {
        // Regular paragraph
        paragraphs.push(new Paragraph({
          children: [new TextRun(trimmedLine)]
        }));
      } else {
        // Empty line
        paragraphs.push(new Paragraph({
          text: ""
        }));
      }
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export to DOCX:', error);
    alert('Failed to export document. Please try again.');
  }
};

export const exportToPdf = (content: string, filename: string): void => {
  try {
    const pdf = new jsPDF();
    const lines = content.split('\n');
    let yPosition = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const maxWidth = pdf.internal.pageSize.width - 2 * margin;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) {
        yPosition += 5;
        return;
      }

      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }

      if (trimmedLine.startsWith('## ')) {
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        const text = trimmedLine.substring(3);
        pdf.text(text, margin, yPosition);
        yPosition += 10;
      } else if (trimmedLine.startsWith('# ')) {
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        const text = trimmedLine.substring(2);
        pdf.text(text, margin, yPosition);
        yPosition += 12;
      } else {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        
        const text = trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') 
          ? '• ' + trimmedLine.substring(2)
          : trimmedLine;
        
        const splitText = pdf.splitTextToSize(text, maxWidth);
        pdf.text(splitText, margin, yPosition);
        yPosition += (splitText.length * 6) + 2;
      }
    });

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Failed to export to PDF:', error);
    alert('Failed to export PDF. Please try again.');
  }
};

export const copyToClipboard = async (content: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(content);
    // You might want to show a toast notification here
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = content;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
};