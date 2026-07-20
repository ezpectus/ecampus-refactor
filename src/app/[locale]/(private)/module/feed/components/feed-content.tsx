'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createFeedComment,
  createFeedPost,
  deleteFeedPost,
  type FeedPostItem,
  getFeedPosts,
  toggleFeedLike,
  uploadFeedImage,
} from '@/actions/feed.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PaginationWithLinks } from '@/components/ui/pagination-with-links';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Show } from '@/components/utils/show';
import { useFeedSSE } from '@/hooks/use-feed-sse';
import { usePagination } from '@/hooks/use-pagination';
import { useServerErrorToast } from '@/hooks/use-server-error-toast';
import { useToast } from '@/hooks/use-toast';
import { PAGE_SIZE_DEFAULT } from '@/lib/constants/page-size';

import { FeedPostCard } from './feed-post-card';

interface Props {
  currentUserId: number;
  isAdmin: boolean;
}

export const FeedContent = ({ currentUserId, isAdmin }: Props) => {
  const t = useTranslations('private.feed');
  const { errorToast } = useServerErrorToast();
  const { toast } = useToast();

  const [posts, setPosts] = useState<FeedPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { paginatedItems } = usePagination(PAGE_SIZE_DEFAULT, posts);

  const loadPosts = useCallback(async () => {
    const result = await getFeedPosts();
    setPosts(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useFeedSSE(loadPosts);

  const handlePost = async () => {
    if (!postContent.trim()) return;
    setSubmitting(true);
    try {
      await createFeedPost({ content: postContent.trim(), imageUrl: postImage || '' });
      setPostContent('');
      setPostImage('');
      toast({ title: t('post-created') });
      await loadPosts();
    } catch {
      errorToast();
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const imageUrl = await uploadFeedImage(formData);
      setPostImage(imageUrl);
      toast({ title: t('image-uploaded') });
    } catch {
      errorToast();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (postId: number) => {
    try {
      await deleteFeedPost(postId);
      toast({ title: t('post-deleted') });
      await loadPosts();
    } catch {
      errorToast();
    }
  };

  const handleLike = async (postId: number) => {
    try {
      await toggleFeedLike(postId);
      await loadPosts();
    } catch {
      errorToast();
    }
  };

  const handleComment = async (postId: number, content: string) => {
    try {
      await createFeedComment({ postId, content });
      await loadPosts();
    } catch {
      errorToast();
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">{t('share-something')}</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder={t('post-placeholder')}
            maxLength={2000}
            rows={3}
          />
          <div className="flex items-center gap-2">
            <Button variant="tertiary" size="small" onClick={() => fileInputRef.current?.click()} loading={uploading}>
              {t('upload-image')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              className="hidden"
            />
            {postImage && (
              <div className="flex items-center gap-2">
                <Image
                  src={postImage}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded object-cover"
                  unoptimized
                />
                <Button variant="tertiary" size="small" onClick={() => setPostImage('')}>
                  ✕
                </Button>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={handlePost} loading={submitting} disabled={!postContent.trim()}>
              {t('post')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center text-sm">{t('empty')}</p>
      ) : (
        <>
          {paginatedItems.map((post) => (
            <FeedPostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onLike={() => handleLike(post.id)}
              onComment={(content) => handleComment(post.id, content)}
              onDelete={() => handleDelete(post.id)}
            />
          ))}
          <Show when={posts.length > PAGE_SIZE_DEFAULT}>
            <PaginationWithLinks page={1} pageSize={PAGE_SIZE_DEFAULT} totalCount={posts.length} />
          </Show>
        </>
      )}
    </div>
  );
};
