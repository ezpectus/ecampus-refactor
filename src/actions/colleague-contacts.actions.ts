'use server';

import { ColleagueContact } from '@/types/models/colleague-contact';
import { ContactType } from '@/types/models/contact';
import { apiFetch } from '@/lib/client';

export async function getColleagueContacts() {
  try {
    const response = await apiFetch<ColleagueContact[]>('contacts');

    if (!response.ok) {
      console.error('Failed to fetch colleague contacts:', response.status, response.statusText);
      return [];
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching colleague contacts:', error);
    return [];
  }
}

export async function getColleagueContactTypes() {
  try {
    const response = await apiFetch<ContactType[]>('contacts/types');

    if (!response.ok) {
      console.error('Failed to fetch contact types:', response.status, response.statusText);
      return [];
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching contact types:', error);
    return [];
  }
}
