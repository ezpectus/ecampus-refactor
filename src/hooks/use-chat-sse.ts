'use client';

import { useEffect, useRef } from 'react';

export function useChatSSE(roomId: number | null, onRefresh: () => void) {
  const cbRef = useRef(onRefresh);
  cbRef.current = onRefresh;

  useEffect(() => {
    if (typeof window === 'undefined' || !roomId) return;

    const es = new EventSource(`/api/chat/stream?roomId=${roomId}`);

    es.addEventListener('data', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        if (data.type === 'new-messages') {
          cbRef.current();
        }
      } catch {
        // ignore parse errors
      }
    });

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [roomId]);
}
