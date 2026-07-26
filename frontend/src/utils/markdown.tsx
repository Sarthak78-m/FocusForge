import React from 'react';
import { cn } from '@/utils/cn';

// ─── Inline Parser ────────────────────────────────────────────────────────────

function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Matches **bold**, *italic*, `code`
  const regex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const key = `${keyPrefix}-${match.index}`;
    if (match[1]) {
      // **bold**
      nodes.push(<strong key={key} className="font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      nodes.push(<em key={key} className="italic">{match[4]}</em>);
    } else if (match[5]) {
      // `code`
      nodes.push(
        <code
          key={key}
          className="rounded bg-stone-200 px-1 py-0.5 font-mono text-xs dark:bg-stone-700"
        >
          {match[6]}
        </code>,
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

// ─── Block Parser ─────────────────────────────────────────────────────────────

type Block =
  | { type: 'h1'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'blockquote'; text: string }
  | { type: 'blank' };

function parseBlocks(content: string): Block[] {
  const lines = content.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      blocks.push({ type: 'blank' });
      i++;
      continue;
    }

    // Headings — check longest prefix first to avoid # matching ## or ###
    const h3Match = line.match(/^###\s+(.+)/);
    if (h3Match) { blocks.push({ type: 'h3', text: h3Match[1] }); i++; continue; }
    const h2Match = line.match(/^##\s+(.+)/);
    if (h2Match) { blocks.push({ type: 'h2', text: h2Match[1] }); i++; continue; }
    const h1Match = line.match(/^#\s+(.+)/);
    if (h1Match) { blocks.push({ type: 'h1', text: h1Match[1] }); i++; continue; }
    if (line.startsWith('> ')) {
      blocks.push({ type: 'blockquote', text: line.slice(2) });
      i++;
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^[-*]\s+(.+)/);
    if (ulMatch) {
      const items: string[] = [ulMatch[1]];
      while (i + 1 < lines.length && lines[i + 1].match(/^[-*]\s+(.+)/)) {
        i++;
        items.push(lines[i].match(/^[-*]\s+(.+)/)![1]);
      }
      blocks.push({ type: 'ul', items });
      i++;
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      const items: string[] = [olMatch[1]];
      while (i + 1 < lines.length && lines[i + 1].match(/^\d+\.\s+(.+)/)) {
        i++;
        items.push(lines[i].match(/^\d+\.\s+(.+)/)![1]);
      }
      blocks.push({ type: 'ol', items });
      i++;
      continue;
    }

    blocks.push({ type: 'paragraph', text: line });
    i++;
  }

  return blocks;
}

// ─── MarkdownContent Component ────────────────────────────────────────────────

type MarkdownContentProps = {
  content: string;
  className?: string;
};

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  const blocks = parseBlocks(content);

  const renderedBlocks = blocks
    .filter((b) => b.type !== 'blank')
    .map((block, blockIdx) => {
      const key = `block-${blockIdx}`;

      if (block.type === 'h1') {
        return (
          <h1 key={key} className="text-base font-bold leading-snug text-stone-900 dark:text-stone-100">
            {parseInline(block.text, key)}
          </h1>
        );
      }

      if (block.type === 'h2') {
        return (
          <h2 key={key} className="text-sm font-semibold leading-snug text-stone-800 dark:text-stone-200">
            {parseInline(block.text, key)}
          </h2>
        );
      }

      if (block.type === 'h3') {
        return (
          <h3 key={key} className="text-sm font-medium leading-snug text-stone-700 dark:text-stone-300">
            {parseInline(block.text, key)}
          </h3>
        );
      }

      if (block.type === 'paragraph') {
        return (
          <p key={key} className="leading-relaxed">
            {parseInline(block.text, key)}
          </p>
        );
      }

      if (block.type === 'ul') {
        return (
          <ul key={key} className="ml-4 list-disc space-y-0.5">
            {block.items.map((item, idx) => (
              <li key={idx}>{parseInline(item, `${key}-${idx}`)}</li>
            ))}
          </ul>
        );
      }

      if (block.type === 'ol') {
        return (
          <ol key={key} className="ml-4 list-decimal space-y-0.5">
            {block.items.map((item, idx) => (
              <li key={idx}>{parseInline(item, `${key}-${idx}`)}</li>
            ))}
          </ol>
        );
      }

      if (block.type === 'blockquote') {
        return (
          <blockquote
            key={key}
            className="border-l-2 border-indigo-300 pl-3 italic text-stone-500 dark:border-indigo-700 dark:text-stone-400"
          >
            {parseInline(block.text, key)}
          </blockquote>
        );
      }

      return null;
    });

  return (
    <div className={cn('space-y-2 text-sm', className)}>
      {renderedBlocks}
    </div>
  );
}
