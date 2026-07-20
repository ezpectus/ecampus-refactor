'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { globalSearch, SearchResult } from '@/actions/search.actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export function GlobalSearch() {
  const t = useTranslations('private.search');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const debouncedSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    const res = await globalSearch(q);
    setResults(res);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void debouncedSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, debouncedSearch]);

  const handleClose = () => {
    setOpen(false);
    setQuery('');
    setResults(null);
  };

  const hasResults =
    results && (results.posts.length > 0 || results.users.length > 0 || results.notifications.length > 0);

  return (
    <>
      <Button
        variant="tertiary"
        size="small"
        className="gap-2"
        onClick={() => setOpen(true)}
        aria-label={t('placeholder')}
      >
        <Search size={16} />
        <span className="text-muted-foreground hidden text-sm md:inline">{t('placeholder')}</span>
        <kbd className="border-border text-muted-foreground hidden rounded border px-1.5 text-[10px] md:inline">
          Ctrl+K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{t('title')}</DialogTitle>
          </DialogHeader>
          <div className="border-border border-b p-4">
            <Input
              autoFocus
              placeholder={t('placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-none text-base shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {loading && (
              <div className="space-y-2 p-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            )}

            {!loading && !hasResults && query.trim().length >= 2 && (
              <p className="text-muted-foreground py-8 text-center text-sm">{t('no-results')}</p>
            )}

            {!loading && !hasResults && query.trim().length < 2 && (
              <p className="text-muted-foreground py-8 text-center text-sm">{t('hint')}</p>
            )}

            {!loading && hasResults && (
              <div className="space-y-4 p-2">
                {results!.users.length > 0 && (
                  <section>
                    <h3 className="text-muted-foreground mb-2 px-2 text-xs font-semibold uppercase">{t('users')}</h3>
                    {results!.users.map((u) => (
                      <div key={u.id} className="flex items-center gap-3 rounded-lg px-2 py-2">
                        <Avatar className="h-8 w-8">
                          {u.photo ? <AvatarImage src={u.photo} alt={u.fullName} /> : null}
                          <AvatarFallback>{u.fullName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{u.fullName}</p>
                          <p className="text-muted-foreground truncate text-xs">
                            @{u.username}
                            {u.faculty ? ` · ${u.faculty}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </section>
                )}

                {results!.posts.length > 0 && (
                  <section>
                    <h3 className="text-muted-foreground mb-2 px-2 text-xs font-semibold uppercase">{t('posts')}</h3>
                    {results!.posts.map((p) => (
                      <Link
                        key={p.id}
                        href="/module/feed"
                        onClick={handleClose}
                        className="hover:bg-muted block rounded-lg px-2 py-2 transition-colors"
                      >
                        <p className="truncate text-sm font-medium">{p.content}</p>
                        <p className="text-muted-foreground text-xs">
                          {p.authorName} · {new Date(p.createdAt).toLocaleDateString()}
                        </p>
                      </Link>
                    ))}
                  </section>
                )}

                {results!.notifications.length > 0 && (
                  <section>
                    <h3 className="text-muted-foreground mb-2 px-2 text-xs font-semibold uppercase">
                      {t('notifications')}
                    </h3>
                    {results!.notifications.map((n) => (
                      <Link
                        key={n.id}
                        href="/notifications"
                        onClick={handleClose}
                        className="hover:bg-muted block rounded-lg px-2 py-2 transition-colors"
                      >
                        <p className="truncate text-sm font-medium">{n.title}</p>
                        <p className="text-muted-foreground truncate text-xs">{n.message}</p>
                      </Link>
                    ))}
                  </section>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
