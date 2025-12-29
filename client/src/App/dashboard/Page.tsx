'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { ThreadCard } from '@/components/card';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { UserAuth } from '@/context/authContext';
import { supabase } from '@/supabaseClient';
import { Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface Profile {
  id: string;
  full_name: string;
  username: string;
  profile_picture?: string;
}

interface Thread {
  id: string;
  created_at: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  created_by: string;
  comment_count?: number;
  like_count?: number;
  view_count?: number;
  author?: Profile;
}

export default function Page() {
  const { userProfile } = UserAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  // Use useCallback so fetchThreads can be a dependency for useEffect
  const fetchThreads = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);

      // 1. Fetch RAW threads (newest first)
      const { data: rawThreads, error: threadsError } = await supabase
        .from('threads')
        .select('*')
        .order('created_at', { ascending: false });

      if (threadsError) throw threadsError;

      const threads = rawThreads || [];

      // 2. Get unique user IDs to fetch profiles for
      // We filter(Boolean) to ensure we don't try to fetch null IDs
      const userIds = Array.from(
        new Set(threads.map((t) => t.created_by).filter(Boolean))
      );

      // 3. Fetch Profiles manually
      let profilesMap: Record<string, Profile> = {};

      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, username') // Removed profile_picture to avoid schema errors
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else if (profiles) {
          // Create a lookup map: { "user_uuid": { profile_data } }
          profilesMap = profiles.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as Record<string, Profile>);
        }
      }

      // 4. Attach profile to thread
      const joinedThreads = threads.map((thread) => ({
        ...thread,
        author: profilesMap[thread.created_by] || null,
      }));

      setThreads(joinedThreads);
    } catch (error) {
      console.error('Error in fetchThreads:', error);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();

    // 1. Custom Event Listener (for when you post from the Dialog)
    const handleLocalUpdate = () => {
      console.log('Local thread event detected, refreshing...');
      fetchThreads(true);
    };
    window.addEventListener('thread-created', handleLocalUpdate);

    // 2. Supabase Realtime Listener (for other people's posts)
    const channel = supabase
      .channel('realtime-threads')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'threads' },
        (payload) => {
          console.log('Realtime INSERT received:', payload);
          fetchThreads(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('thread-created', handleLocalUpdate);
    };
  }, [fetchThreads]);

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex-1 rounded-xl">
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : threads.length > 0 ? (
                threads.map((thread) => {
                  // --- Display Logic ---
                  let authorName = 'BRACU Student';
                  let authorHandle = '@user';
                  let authorAvatar = '';

                  // Case A: Profile found in DB (Success case)
                  if (thread.author && thread.author.full_name) {
                    authorName = thread.author.full_name;
                    authorHandle = thread.author.username
                      ? `@${thread.author.username}`
                      : '@user';
                    authorAvatar = thread.author.profile_picture;
                  }
                  // Case B: Fallback to local context (It's me, but DB might have lagged)
                  else if (
                    userProfile &&
                    thread.created_by === userProfile.id
                  ) {
                    authorName =
                      userProfile.name || userProfile.full_name || 'Me';
                    authorHandle = userProfile.username
                      ? `@${userProfile.username}`
                      : '@me';
                    // We don't override avatar here unless we have it in userProfile
                  }

                  return (
                    <ThreadCard
                      key={thread.id}
                      post={{
                        id: thread.id,
                        author: {
                          name: authorName,
                          handle: authorHandle,
                          avatarUrl: authorAvatar,
                        },
                        date: new Date(thread.created_at).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                          }
                        ),
                        content: thread.title,
                        category: thread.category, // PASSING CATEGORY
                        tags: thread.tags, // PASSING TAGS
                        stats: {
                          replies: thread.comment_count || 0,
                          reposts: 0,
                          likes: thread.like_count || 0,
                          views: thread.view_count || 0,
                        },
                      }}
                    />
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">
                    No threads found yet. Be the first to post!
                  </p>
                </div>
              )}
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
