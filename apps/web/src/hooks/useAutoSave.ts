'use client';

import { useEffect, useRef } from 'react';

export function useAutoSave(
  content: string,
  onSave: (content: string) => void,
  delay: number = 1000
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>(content);

  useEffect(() => {
    if (content === lastContentRef.current) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSave(content);
      lastContentRef.current = content;
      // 自动保存成功
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, onSave, delay]);

  return {
    isDirty: content !== lastContentRef.current,
  };
}
