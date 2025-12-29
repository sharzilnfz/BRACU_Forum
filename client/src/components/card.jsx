import { ThreadModal } from '@/components/thread-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserAuth } from '@/context/authContext';
import { cn } from '@/lib/utils';
import { supabase } from '@/supabaseClient';
import {
  ArrowBigDown,
  ArrowBigUp,
  MessageCircle,
  MoreHorizontal,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export const ThreadCard = ({ post }) => {
  const { userProfile } = UserAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userVote, setUserVote] = useState(null); // 'upvote', 'downvote', or null
  const [upvoteCount, setUpvoteCount] = useState(post.stats?.upvotes || 0);
  const [downvoteCount, setDownvoteCount] = useState(
    post.stats?.downvotes || 0
  );
  const [isVoting, setIsVoting] = useState(false);

  // Fetch user's current vote when component mounts
  useEffect(() => {
    if (userProfile?.id && post.id) {
      fetchUserVote();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.id, post.id]);

  const fetchUserVote = async () => {
    try {
      const { data, error } = await supabase
        .from('thread_votes')
        .select('vote_type')
        .eq('thread_id', post.id)
        .eq('user_id', userProfile.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user vote:', error);
        return;
      }

      setUserVote(data?.vote_type || null);
    } catch (error) {
      console.error('Error in fetchUserVote:', error);
    }
  };

  const handleVote = async (voteType) => {
    // Prevent voting if not logged in
    if (!userProfile?.id) {
      alert('Please log in to vote');
      return;
    }

    // Prevent multiple simultaneous votes
    if (isVoting) return;

    setIsVoting(true);

    // Store previous state for rollback
    const previousVote = userVote;
    const previousUpvotes = upvoteCount;
    const previousDownvotes = downvoteCount;

    try {
      // Calculate new counts optimistically
      let newUpvotes = upvoteCount;
      let newDownvotes = downvoteCount;

      if (previousVote === voteType) {
        // Removing vote
        setUserVote(null);
        if (voteType === 'upvote') {
          newUpvotes = Math.max(0, upvoteCount - 1);
          setUpvoteCount(newUpvotes);
        } else {
          newDownvotes = Math.max(0, downvoteCount - 1);
          setDownvoteCount(newDownvotes);
        }
      } else if (previousVote === null) {
        // Adding new vote
        setUserVote(voteType);
        if (voteType === 'upvote') {
          newUpvotes = upvoteCount + 1;
          setUpvoteCount(newUpvotes);
        } else {
          newDownvotes = downvoteCount + 1;
          setDownvoteCount(newDownvotes);
        }
      } else {
        // Changing vote
        setUserVote(voteType);
        if (voteType === 'upvote') {
          newUpvotes = upvoteCount + 1;
          newDownvotes = Math.max(0, downvoteCount - 1);
          setUpvoteCount(newUpvotes);
          setDownvoteCount(newDownvotes);
        } else {
          newDownvotes = downvoteCount + 1;
          newUpvotes = Math.max(0, upvoteCount - 1);
          setUpvoteCount(newUpvotes);
          setDownvoteCount(newDownvotes);
        }
      }

      // Call the database function
      const { error } = await supabase.rpc('toggle_thread_vote', {
        p_thread_id: post.id,
        p_user_id: userProfile.id,
        p_vote_type: voteType,
      });

      if (error) throw error;

      // Fetch updated counts from database to ensure accuracy
      const { data: threadData, error: fetchError } = await supabase
        .from('threads')
        .select('upvote_count, downvote_count')
        .eq('id', post.id)
        .single();

      if (fetchError) throw fetchError;

      // Update with actual counts from database
      setUpvoteCount(threadData.upvote_count || 0);
      setDownvoteCount(threadData.downvote_count || 0);

      // Dispatch event to refresh thread list
      window.dispatchEvent(new Event('thread-updated'));
    } catch (error) {
      console.error('Error voting:', error);
      // Revert optimistic update on error
      setUserVote(previousVote);
      setUpvoteCount(previousUpvotes);
      setDownvoteCount(previousDownvotes);
      alert('Failed to vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleCardClick = (e) => {
    // Don't open modal if clicking on interactive elements
    if (e.target.closest('button')) return;
    setIsModalOpen(true);
  };

  // Debug log to verify post data
  console.log('ThreadCard post:', post);

  // Calculate net score
  const netScore = upvoteCount - downvoteCount;

  return (
    <>
      <div
        className="w-full max-w-2xl cursor-pointer border-b border-border bg-card p-4 text-card-foreground transition-colors hover:bg-muted/50"
        onClick={handleCardClick}
      >
        <div className="flex gap-4">
          {/* Avatar Column */}
          <div className="flex flex-col items-center gap-2">
            <Avatar className="cursor-pointer ring-2 ring-transparent transition-all hover:ring-ring">
              <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
              <AvatarFallback className="text-foreground">
                {post.author.name[0]}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Content Column */}
          <div className="flex grow flex-col gap-2">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[15px] hover:underline cursor-pointer">
                  {post.author.name}
                </span>
                <span className="text-muted-foreground text-[15px]">
                  @{post.author.handle}
                </span>
                <span className="text-muted-foreground text-[15px]">·</span>
                <span className="text-muted-foreground text-[15px] hover:underline cursor-pointer">
                  {post.date}
                </span>
                {post.category && (
                  <Badge
                    variant="secondary"
                    className="ml-2 text-xs font-normal"
                  >
                    {post.category}
                  </Badge>
                )}
              </div>
              <button className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* Body */}
            <div>
              <h3 className="mb-1 text-base font-bold leading-snug">
                {post.content}
              </h3>
              {post.fullContent && (
                <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-muted-foreground">
                  {post.fullContent}
                </div>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-blue-500 hover:underline text-sm cursor-pointer"
                  >
                    {tag.replace(/^#+/, '#')}
                  </span>
                ))}
              </div>
            )}

            {/* Footer / Actions */}
            <div className="mt-2 flex items-center justify-between pr-12">
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote('upvote');
                  }}
                  disabled={isVoting}
                  className={cn(
                    'group flex items-center gap-1.5 transition-colors disabled:opacity-50',
                    userVote === 'upvote'
                      ? 'text-green-500'
                      : 'text-muted-foreground hover:text-green-500'
                  )}
                >
                  <div
                    className={cn(
                      'rounded-full p-2 transition-colors',
                      userVote === 'upvote'
                        ? 'bg-green-500/10'
                        : 'group-hover:bg-green-500/10'
                    )}
                  >
                    <ArrowBigUp
                      size={22}
                      className={cn(userVote === 'upvote' && 'fill-current')}
                    />
                  </div>
                </button>
                <span
                  className={cn(
                    'text-sm font-medium min-w-8 text-center',
                    netScore > 0 && 'text-green-500',
                    netScore < 0 && 'text-red-500'
                  )}
                >
                  {netScore}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote('downvote');
                  }}
                  disabled={isVoting}
                  className={cn(
                    'group flex items-center gap-1.5 transition-colors disabled:opacity-50',
                    userVote === 'downvote'
                      ? 'text-red-500'
                      : 'text-muted-foreground hover:text-red-500'
                  )}
                >
                  <div
                    className={cn(
                      'rounded-full p-2 transition-colors',
                      userVote === 'downvote'
                        ? 'bg-red-500/10'
                        : 'group-hover:bg-red-500/10'
                    )}
                  >
                    <ArrowBigDown
                      size={22}
                      className={cn(userVote === 'downvote' && 'fill-current')}
                    />
                  </div>
                </button>
              </div>

              <button
                className="group flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-blue-400"
                onClick={() => setIsModalOpen(true)}
              >
                <div className="rounded-full p-2 transition-colors group-hover:bg-blue-500/10">
                  <MessageCircle size={18} />
                </div>
                <span className="text-xs font-medium">
                  {post.stats.replies}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ThreadModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        post={post}
      />
    </>
  );
};
