'use server';

import { Contact, ContactType } from '@/types/models/contact';
import { campusFetch } from '@/lib/client';
import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';

import { USER_PROFILE_CACHE_TAG } from '@/lib/constants/cache-tags';

export async function getContacts() {
  try {
    const response = await campusFetch<Contact[]>('profile/contacts');

    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    return [];
  }
}

export async function getContactTypes() {
  try {
    const response = await campusFetch<ContactType[]>('profile/contacts/types');

    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    return [];
  }
}

export async function createContact(typeId: number, value: string) {
  try {
    const response = await campusFetch('profile/contacts', {
      method: 'POST',
      body: JSON.stringify({ typeId, value }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create contact: ${response.status}`);
    }

    revalidateTag(USER_PROFILE_CACHE_TAG);
  } catch (error) {
    throw new Error('Error while creating contact', { cause: error });
  }
}

export async function updateContact(id: number, typeId: number, value: string) {
  try {
    const response = await campusFetch(`profile/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ typeId, value }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update contact: ${response.status}`);
    }

    revalidateTag(USER_PROFILE_CACHE_TAG);
  } catch (error) {
    throw new Error('Error while updating contact', { cause: error });
  }
}

export async function deleteContact(id: number) {
  try {
    const response = await campusFetch(`profile/contacts/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete contact: ${response.status}`);
    }

    revalidateTag(USER_PROFILE_CACHE_TAG);
  } catch (error) {
    throw new Error('Error while deleting contact', { cause: error });
  }
}


export async function updateIntellectInfo(credo: string, scientificInterests: string) {
  try {
    const response = await campusFetch('profile/intellect', {
      method: 'PUT',
      body: JSON.stringify({ credo, scientificInterests }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update intellect info: ${response.status}`);
    }
    revalidateTag(USER_PROFILE_CACHE_TAG);
  } catch (error) {
    throw new Error('Error while updating intellect info', { cause: error });
  }
}

export async function acceptCodeOfHonor() {
  try {
    const response = await campusFetch('profile/code-of-honor', {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error(`Failed to accept code of honor: ${response.status}`);
    }
  } catch (error) {
    throw new Error('Error while accepting code of honor', { cause: error });
  }
  redirect('/');
}

export async function acceptPrivacyConsent() {
  try {
    const response = await campusFetch('profile/privacy-consent', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to accept privacy consent: ${response.status}`);
    }
    revalidateTag(USER_PROFILE_CACHE_TAG);
  } catch (error) {
    throw new Error('Error while accepting privacy consent', { cause: error });
  }
}
