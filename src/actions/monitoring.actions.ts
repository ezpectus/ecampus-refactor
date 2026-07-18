'use server';

import { apiFetch } from '@/lib/client';
import { Sheet } from '@/types/models/current-control/sheet';
import { CreditModule } from '@/types/models/current-control/credit-module';

export async function getMonitoring() {
  const response = await apiFetch<Sheet>('monitoring');

  if (!response.ok) {
    throw new Error(`${response.status} Error`);
  }

  return response.json();
}

export async function getMonitoringById(id: string) {
  const response = await apiFetch<CreditModule>(`monitoring/${id}`);

  if (!response.ok) {
    throw new Error(`${response.status} Error`);
  }

  return response.json();
}
