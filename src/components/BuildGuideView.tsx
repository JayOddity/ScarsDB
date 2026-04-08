'use client';

interface BuildGuideViewProps {
  markdown: string;
}

// Simple markdown to HTML renderer — supports headings, bold, italic, lists, code, links, paragraphs
function renderMarkdown(md: string): string {
  let html = md
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr />')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Process blocks: lists and paragraphs
  const lines = html.split('\n');
  const blocks: string[] = [];
  let inList = false;
  let listType = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      if (inList) {
        blocks.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
      }
      continue;
    }

    // Already processed headings / hr
    if (trimmed.startsWith('<h') || trimmed.startsWith('<hr')) {
      if (inList) {
        blocks.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
      }
      blocks.push(trimmed);
      continue;
    }

    // Unordered list
    const ulMatch = trimmed.match(/^[-*] (.+)$/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) blocks.push(listType === 'ul' ? '</ul>' : '</ol>');
        blocks.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      blocks.push(`<li>${ulMatch[1]}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = trimmed.match(/^\d+\. (.+)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) blocks.push(listType === 'ul' ? '</ul>' : '</ol>');
        blocks.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      blocks.push(`<li>${olMatch[1]}</li>`);
      continue;
    }

    // Regular paragraph
    if (inList) {
      blocks.push(listType === 'ul' ? '</ul>' : '</ol>');
      inList = false;
    }
    blocks.push(`<p>${trimmed}</p>`);
  }

  if (inList) {
    blocks.push(listType === 'ul' ? '</ul>' : '</ol>');
  }

  return blocks.join('\n');
}

export default function BuildGuideView({ markdown }: BuildGuideViewProps) {
  const html = renderMarkdown(markdown);

  return (
    <div
      className="build-guide prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        // Inline styles for the guide content since we don't have a prose plugin
      }}
    />
  );
}
