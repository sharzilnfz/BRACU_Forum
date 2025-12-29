'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { ThreadCard } from '@/components/card';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { UserAuth } from '@/context/authContext';
import { supabase } from '@/supabaseClient';
import { Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
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
  upvote_count?: number;
  downvote_count?: number;
  author?: Profile;
}

export default function Page() {
  const { userProfile, loading } = UserAuth();
  const navigate = useNavigate(); // Initialize navigation
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // --- 1. PROTECT THE ROUTE ---
  useEffect(() => {
    // Determine if we are still loading auth
    if (loading) return;

    // If no user is logged in after loading, redirect immediately
    if (!userProfile) {
      navigate('/signin'); // Change '/signin' to your actual login route
    }
  }, [userProfile, loading, navigate]);

  const fetchThreads = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsFetching(true);

      const { data: rawThreads, error: threadsError } = await supabase
        .from('threads')
        .select('*')
        .order('created_at', { ascending: false });

      if (threadsError) throw threadsError;

      const threads = rawThreads || [];

      const userIds = Array.from(
        new Set(threads.map((t) => t.created_by).filter(Boolean))
      );

      let profilesMap: Record<string, Profile> = {};

      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else if (profiles) {
          profilesMap = profiles.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as Record<string, Profile>);
        }
      }

      const joinedThreads = threads.map((thread) => ({
        ...thread,
        author: profilesMap[thread.created_by] || null,
      }));

      setThreads(joinedThreads);
    } catch (error) {
      console.error('Error in fetchThreads:', error);
    } finally {
      if (!isSilent) setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch threads if we have a user (optimization)
    if (userProfile) {
      fetchThreads();

      const handleLocalUpdate = () => {
        console.log('Local thread event detected, refreshing...');
        fetchThreads(true);
      };
      window.addEventListener('thread-created', handleLocalUpdate);
      window.addEventListener('thread-updated', handleLocalUpdate);

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
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'threads' },
          (payload) => {
            console.log('Realtime UPDATE received:', payload);
            fetchThreads(true);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
        window.removeEventListener('thread-created', handleLocalUpdate);
        window.removeEventListener('thread-updated', handleLocalUpdate);
      };
    }
  }, [fetchThreads, userProfile]); // added userProfile dependency

  if (loading || (!userProfile && loading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return null; // Will redirect in useEffect
  }

  // Filter threads based on search query and selected category
  const filteredThreads = threads.filter((thread) => {
    const matchesSearch =
      !searchQuery ||
      thread.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory || thread.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader onSearch={setSearchQuery} />
        <div className="flex flex-1">
          <AppSidebar
            onCategorySelect={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
          <SidebarInset className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex-1 rounded-xl">
              {/* Thread count display */}
              {(searchQuery || selectedCategory) && (
                <div className="mb-4 text-sm text-muted-foreground">
                  Found {filteredThreads.length} thread
                  {filteredThreads.length !== 1 ? 's' : ''}
                  {searchQuery && ` matching "${searchQuery}"`}
                  {selectedCategory && ` in ${selectedCategory}`}
                </div>
              )}

              {isFetching ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredThreads.length > 0 ? (
                filteredThreads.map((thread) => {
                  let authorName = 'BRACU Student';
                  let authorHandle = 'user';
                  let authorAvatar = '';

                  if (thread.author && thread.author.full_name) {
                    authorName = thread.author.full_name;
                    authorHandle = thread.author.username
                      ? thread.author.username
                      : 'user';
                    authorAvatar = thread.author.avatar_url || '';
                  } else if (
                    userProfile &&
                    thread.created_by === userProfile.id
                  ) {
                    authorName =
                      userProfile.name || userProfile.full_name || 'Me';
                    authorHandle = userProfile.username
                      ? userProfile.username
                      : 'me';
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
                        category: thread.category,
                        tags: thread.tags,
                        stats: {
                          replies: thread.comment_count || 0,
                          reposts: 0,
                          likes: thread.like_count || 0,
                          views: thread.view_count || 0,
                          upvotes: thread.upvote_count || 0,
                          downvotes: thread.downvote_count || 0,
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
