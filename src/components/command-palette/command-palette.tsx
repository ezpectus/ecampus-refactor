'use client';

import { Command } from 'cmdk';
import { BarChart3, Bell, Contact, FileText, GraduationCap, Shield, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import { globalSearch, type SearchResult } from '@/actions/search.actions';
import {
  Books,
  CalendarBlank,
  ChartBarHorizontal,
  ChatsTeardrop,
  EnvelopeSimple,
  Gear,
  House,
  MagnifyingGlassBold,
  UserCircle,
} from '@/app/images';
import { useRouter } from '@/i18n/routing';

type CommandItem = {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
};

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const t = useTranslations('global.menu');
  const tCmd = useTranslations('commandPalette');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults(null);
      setSearching(false);
      return;
    }
    try {
      const results = await globalSearch(query);
      setSearchResults(results);
    } catch {
      setSearchResults(null);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value.trim().length < 2) {
        setSearchResults(null);
        setSearching(false);
        return;
      }
      setSearching(true);
      debounceRef.current = setTimeout(() => void performSearch(value), 300);
    },
    [performSearch],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSearchResults(null);
      setSearching(false);
    }
  }, [open]);

  const items: CommandItem[] = [
    { label: t('main'), icon: <House />, action: () => navigate('/'), group: tCmd('groups.navigation') },
    { label: t('profile'), icon: <UserCircle />, action: () => navigate('/profile'), group: tCmd('groups.navigation') },
    { label: t('settings'), icon: <Gear />, action: () => navigate('/settings'), group: tCmd('groups.navigation') },
    {
      label: tCmd('items.grades'),
      icon: <ChartBarHorizontal />,
      action: () => navigate('/module/studysheet'),
      group: tCmd('groups.modules'),
    },
    {
      label: tCmd('items.schedule'),
      icon: <CalendarBlank />,
      action: () => navigate('/module/schedule'),
      group: tCmd('groups.modules'),
    },
    {
      label: tCmd('items.messages'),
      icon: <EnvelopeSimple />,
      action: () => navigate('/module/msg'),
      group: tCmd('groups.modules'),
    },
    {
      label: tCmd('items.materials'),
      icon: <Books />,
      action: () => navigate('/module/mob'),
      group: tCmd('groups.modules'),
    },
    {
      label: tCmd('items.announcements'),
      icon: <ChatsTeardrop />,
      action: () => navigate('/module/announcementseditor'),
      group: tCmd('groups.modules'),
    },
    {
      label: tCmd('items.grading'),
      icon: <GraduationCap size={16} />,
      action: () => navigate('/module/grading'),
      group: tCmd('groups.modules'),
    },
    {
      label: tCmd('items.certificates'),
      icon: <FileText size={16} />,
      action: () => navigate('/module/certificates'),
      group: tCmd('groups.modules'),
    },
    {
      label: tCmd('items.directory'),
      icon: <Contact size={16} />,
      action: () => navigate('/module/directory'),
      group: tCmd('groups.modules'),
    },
    {
      label: t('contacts'),
      icon: <Users size={16} />,
      action: () => navigate('/contacts'),
      group: tCmd('groups.navigation'),
    },
    {
      label: t('admin'),
      icon: <Shield size={16} />,
      action: () => navigate('/module/admin'),
      group: tCmd('groups.navigation'),
    },
    {
      label: t('parent'),
      icon: <Users size={16} />,
      action: () => navigate('/module/parent'),
      group: tCmd('groups.navigation'),
    },
    {
      label: t('analytics'),
      icon: <BarChart3 size={16} />,
      action: () => navigate('/module/analytics'),
      group: tCmd('groups.navigation'),
    },
  ];

  const hasSearchResults =
    searchResults &&
    (searchResults.posts.length > 0 || searchResults.users.length > 0 || searchResults.notifications.length > 0);
  const showSearch = searchQuery.trim().length >= 2;

  if (!open) return null;

  const groups = Array.from(new Set(items.map((item) => item.group)));

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <Command
        className="border-border bg-card text-card-foreground mx-auto w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-border flex items-center gap-3 border-b px-4">
          <MagnifyingGlassBold />
          <Command.Input
            placeholder={tCmd('placeholder')}
            value={searchQuery}
            onValueChange={handleSearchChange}
            className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
            autoFocus
          />
          {searching && <span className="text-xs text-neutral-400">...</span>}
        </div>
        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-neutral-400">{tCmd('empty')}</Command.Empty>

          {showSearch && hasSearchResults && (
            <>
              {searchResults.posts.length > 0 && (
                <Command.Group
                  key="search-posts"
                  heading={tCmd('groups.searchPosts')}
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-400"
                >
                  {searchResults.posts.map((post) => (
                    <Command.Item
                      key={`post-${post.id}`}
                      onSelect={() => navigate('/module/feed')}
                      className="text-foreground data-[selected=true]:bg-muted flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm"
                    >
                      <ChatsTeardrop className="shrink-0 text-neutral-400" width={16} height={16} />
                      <span className="truncate">{post.content.slice(0, 60)}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
              {searchResults.users.length > 0 && (
                <Command.Group
                  key="search-users"
                  heading={tCmd('groups.searchUsers')}
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-400"
                >
                  {searchResults.users.map((user) => (
                    <Command.Item
                      key={`user-${user.id}`}
                      onSelect={() => navigate(`/module/directory`)}
                      className="text-foreground data-[selected=true]:bg-muted flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm"
                    >
                      <Users className="shrink-0 text-neutral-400" width={16} height={16} />
                      <span className="truncate">
                        {user.fullName} <span className="text-neutral-400">@{user.username}</span>
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
              {searchResults.notifications.length > 0 && (
                <Command.Group
                  key="search-notifications"
                  heading={tCmd('groups.searchNotifications')}
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-400"
                >
                  {searchResults.notifications.map((notif) => (
                    <Command.Item
                      key={`notif-${notif.id}`}
                      onSelect={() => navigate('/notifications')}
                      className="text-foreground data-[selected=true]:bg-muted flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm"
                    >
                      <Bell className="shrink-0 text-neutral-400" width={16} height={16} />
                      <span className="truncate">{notif.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </>
          )}

          {showSearch && !hasSearchResults && !searching && (
            <div className="py-6 text-center text-sm text-neutral-400">{tCmd('empty')}</div>
          )}

          {!showSearch &&
            groups.map((group) => (
              <Command.Group
                key={group}
                heading={group}
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-400"
              >
                {items
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <Command.Item
                      key={item.label}
                      onSelect={() => item.action()}
                      className="text-foreground data-[selected=true]:bg-muted data-[selected=true]:text-foreground flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm"
                    >
                      <span className="text-neutral-400">{item.icon}</span>
                      {item.label}
                    </Command.Item>
                  ))}
              </Command.Group>
            ))}
        </Command.List>
        <div className="border-border text-muted-foreground flex items-center justify-between border-t px-4 py-2 text-xs">
          <span>{tCmd('hint')}</span>
          <kbd className="rounded border border-neutral-200 px-1.5 py-0.5 font-sans text-xs">ESC</kbd>
        </div>
      </Command>
    </div>
  );
};
