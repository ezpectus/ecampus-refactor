'use server';

import { apiFetch } from '@/lib/client';
import { Term } from '@/types/models/term';

export async function getTerm() {
  const response = await apiFetch<Term>('/term');
  if (!response.ok) {
    throw new Error(`${response.status} Error`);
  }

  return response.json();
}
