'use server';

import { getLocalUserLite } from '@/actions/local-user.actions';
import { prisma } from '@/lib/prisma';

export interface SearchResult {
  posts: {
    id: number;
    content: string;
    imageUrl: string | null;
    authorName: string;
    authorPhoto: string;
    createdAt: string;
  }[];
  users: {
    id: number;
    fullName: string;
    username: string;
    photo: string;
    role: string;
    faculty: string | null;
  }[];
  notifications: {
    id: number;
    title: string;
    message: string;
    type: string;
    createdAt: string;
  }[];
}

export async function globalSearch(query: string): Promise<SearchResult> {
  const user = await getLocalUserLite();
  if (!user || !query.trim()) {
    return { posts: [], users: [], notifications: [] };
  }

  const q = query.trim();
  const schoolFilter = user.schoolId ? { schoolId: user.schoolId } : {};

  const [posts, users, notifications] = await Promise.all([
    prisma.feedPost
      .findMany({
        where: {
          ...schoolFilter,
          OR: [{ content: { contains: q } }, { author: { fullName: { contains: q } } }],
        },
        include: {
          author: { select: { id: true, fullName: true, photo: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
      .catch(() => []),
    prisma.user
      .findMany({
        where: {
          ...schoolFilter,
          OR: [
            { fullName: { contains: q } },
            { username: { contains: q } },
            { email: { contains: q } },
            { speciality: { contains: q } },
          ],
        },
        select: {
          id: true,
          fullName: true,
          username: true,
          photo: true,
          role: true,
          faculty: true,
        },
        take: 10,
      })
      .catch(() => []),
    prisma.notification
      .findMany({
        where: {
          userId: user.id,
          OR: [{ title: { contains: q } }, { message: { contains: q } }],
        },
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
      .catch(() => []),
  ]);

  return {
    posts: posts.map((p) => ({
      id: p.id,
      content: p.content,
      imageUrl: p.imageUrl,
      authorName: p.author.fullName,
      authorPhoto: p.author.photo,
      createdAt: p.createdAt.toISOString(),
    })),
    users: users.map((u) => ({
      id: u.id,
      fullName: u.fullName,
      username: u.username,
      photo: u.photo,
      role: u.role,
      faculty: u.faculty,
    })),
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      createdAt: n.createdAt.toISOString(),
    })),
  };
}
