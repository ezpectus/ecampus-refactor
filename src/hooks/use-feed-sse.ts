'use client';

import { useEffect, useRef } from 'react';

export function useFeedSSE(onRefresh: () => void) {
  const cbRef = useRef(onRefresh);
  cbRef.current = onRefresh;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const es = new EventSource('/api/feed/stream');

    es.addEventListener('new-post', () => {
      cbRef.current();
    });

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, []);
}
