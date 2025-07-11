'use client';

import React from 'react';

export function MarkdownContent({ content }: { content: string }) {
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (currentList.length > 0) {
      const ListComponent = listType === 'ol' ? 'ol' : 'ul';
      const listClasses = listType === 'ol' 
        ? "list-decimal pl-5 space-y-2 mb-4" 
        : "list-disc pl-5 space-y-2 mb-4";
      elements.push(<ListComponent key={`list-${elements.length}`} className={listClasses}>{currentList}</ListComponent>);
      currentList = [];
      listType = null;
    }
  };

  const lines = content.split('\n').filter(line => line.trim() !== '');

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      currentList.push(<li key={index}>{trimmedLine.substring(2)}</li>);
    } else if (/^\d+\.\s/.test(trimmedLine)) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      currentList.push(<li key={index}>{trimmedLine.substring(trimmedLine.indexOf(' ') + 1)}</li>);
    } else {
      flushList();
      elements.push(<p key={index} className="mb-4">{trimmedLine}</p>);
    }
  });
  
  flushList();

  if (elements.length === 0) {
    return <p>{content}</p>;
  }

  return <>{elements}</>;
}
