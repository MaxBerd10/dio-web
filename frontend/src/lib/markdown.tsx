import React from 'react';

/**
 * Yengil markdown render — full library shart emas, oddiy formatlash.
 * Qo'llab-quvvatlaydi:
 *  - **bold**
 *  - qatorlarni \n bilan ajratish
 *  - "- " bilan boshlangan qatorlar bullet point
 */
export function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split('\n');

  const blocks: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = () => {
    if (currentList.length === 0) return;
    blocks.push(
      <ul
        key={`ul-${blocks.length}`}
        className="list-disc pl-5 space-y-1 my-2"
      >
        {currentList.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    currentList = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('- ')) {
      currentList.push(trimmed.slice(2));
    } else if (trimmed === '') {
      flushList();
      blocks.push(<div key={`spacer-${i}`} className="h-2" />);
    } else {
      flushList();
      blocks.push(
        <p key={`p-${i}`} className="leading-relaxed">
          {renderInline(line)}
        </p>,
      );
    }
  });
  flushList();

  return <>{blocks}</>;
}

function renderInline(text: string): React.ReactNode {
  // **bold** ni topib ajratamiz
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index));
    }
    parts.push(
      <strong key={key++} className="font-semibold">
        {match[1]}
      </strong>,
    );
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }
  return parts.length > 0 ? parts : text;
}