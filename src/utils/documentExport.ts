export const exportToDocx = async (content: string, filename: string): Promise<void> => {
  downloadTextFile(content, `${filename}.md`, 'text/markdown;charset=utf-8');
};

export const exportToPdf = (content: string, filename: string): void => {
  downloadTextFile(content, `${filename}.md`, 'text/markdown;charset=utf-8');
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
