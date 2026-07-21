'use client';

import { useEffect, useRef } from 'react';

const MAX_RECONNECT_DELAY = 10_000;
const BASE_RECONNECT_DELAY = 1_000;

export function useFeedSSE(onRefresh: () => void) {
  const cbRef = useRef(onRefresh);
  cbRef.current = onRefresh;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectAttempts = 0;
    let isClosed = false;

    const connect = () => {
      if (isClosed) return;
      es = new EventSource('/api/feed/stream');

      es.addEventListener('data', (e) => {
        try {
          const data = JSON.parse((e as MessageEvent).data);
          if (data.type === 'new-post') {
            cbRef.current();
          }
        } catch {
          // ignore parse errors
        }
      });

      es.onerror = () => {
        es?.close();
        if (isClosed) return;
        reconnectAttempts++;
        const delay = Math.min(BASE_RECONNECT_DELAY * 2 ** reconnectAttempts, MAX_RECONNECT_DELAY);
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      isClosed = true;
      es?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);
}
