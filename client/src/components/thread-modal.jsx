import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { UserAuth } from '@/context/authContext';
import { supabase } from '@/supabaseClient';
import { MessageCircle, Send, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';

function CommentItem({ comment }) {
  return (
    <div className="group animate-in fade-in-0 slide-in-from-top-1 border-b border-border py-4 last:border-b-0">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage
            src={comment.author?.avatar_url}
            alt={comment.author?.name}
          />
          <AvatarFallback className="text-xs">
            {comment.author?.name?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-sm font-semibold text-foreground">
              {comment.author?.name || 'Anonymous'}
            </span>
            <span className="text-xs text-muted-foreground">
              @{comment.author?.username || 'user'}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>

          <p className="text-sm leading-relaxed text-foreground/90">
            {comment.content}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ThreadModal({ open, onOpenChange, post }) {
  const { userProfile } = UserAuth();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch comments when modal opens
  useEffect(() => {
    if (open && post?.id) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, post?.id]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('thread_id', post.id)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Fetch author profiles for all comments
      const userIds = Array.from(
        new Set(commentsData.map((c) => c.created_by).filter(Boolean))
      );

      let profilesMap = {};
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url')
          .in('id', userIds);

        if (!profilesError && profiles) {
          profilesMap = profiles.reduce((acc, profile) => {
            acc[profile.id] = {
              name: profile.full_name,
              username: profile.username,
              avatar_url: profile.avatar_url,
            };
            return acc;
          }, {});
        }
      }

      // Join comments with author data
      const enrichedComments = commentsData.map((comment) => ({
        ...comment,
        author: profilesMap[comment.created_by] || {
          name: 'Anonymous',
          username: 'user',
          avatar_url: '',
        },
      }));

      setComments(enrichedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !userProfile?.id) return;

    try {
      setIsSubmitting(true);

      // Insert the comment
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .insert([
          {
            thread_id: post.id,
            content: newComment.trim(),
            created_by: userProfile.id,
          },
        ])
        .select()
        .single();

      if (commentError) throw commentError;

      // Increment the comment count in the threads table
      const { error: updateError } = await supabase.rpc(
        'increment_comment_count',
        {
          thread_id: post.id,
        }
      );

      if (updateError) {
        console.error('Error incrementing comment count:', updateError);
        // Fallback: manually update if RPC doesn't exist
        const { data: threadData } = await supabase
          .from('threads')
          .select('comment_count')
          .eq('id', post.id)
          .single();

        await supabase
          .from('threads')
          .update({ comment_count: (threadData?.comment_count || 0) + 1 })
          .eq('id', post.id);
      }

      // Add the new comment to the list with author info
      const newCommentWithAuthor = {
        ...commentData,
        author: {
          name: userProfile.name,
          username: userProfile.username,
          avatar_url: userProfile.avatar_url,
        },
      };

      setComments([...comments, newCommentWithAuthor]);
      setNewComment('');

      // Dispatch event to refresh thread list
      window.dispatchEvent(new Event('thread-updated'));
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-dvh w-full max-w-full overflow-y-auto p-0 sm:max-h-[90vh] sm:max-w-3xl sm:rounded-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Thread Details</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          {/* Post Body */}
          <div className="p-4 sm:p-6 sm:pb-4">
            {/* Author & Meta */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                  />
                  <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col leading-none">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {post.author.name}
                    </span>
                    {post.category && (
                      <Badge
                        variant="outline"
                        className="hidden h-5 px-1.5 text-[10px] sm:inline-flex"
                      >
                        {post.category}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>@{post.author.handle}</span>
                    <span>·</span>
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>

              {/* <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
              >
                <MoreHorizontal size={18} />
              </Button> */}
            </div>

            {/* Mobile Category Badge */}
            {post.category && (
              <div className="mt-3 sm:hidden">
                <Badge variant="secondary" className="text-xs">
                  {post.category}
                </Badge>
              </div>
            )}

            {/* Title & Content */}
            <div className="mt-4 space-y-3">
              <h2 className="text-lg font-bold leading-tight sm:text-2xl">
                {post.content}
              </h2>
              {post.fullContent && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground sm:text-base">
                  {post.fullContent}
                </p>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer font-normal hover:bg-secondary/80"
                  >
                    {tag.replace(/^#+/, '#')}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats / Actions */}
            <div className="mt-6 flex items-center gap-4 border-t pt-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} />
                <span className="text-sm font-medium">
                  {comments.length}{' '}
                  <span className="hidden sm:inline">
                    {comments.length === 1 ? 'Comment' : 'Comments'}
                  </span>
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 px-2 text-muted-foreground hover:text-foreground"
              >
                <Share2 size={18} />
                <span className="hidden text-sm font-medium sm:inline">
                  Share
                </span>
              </Button>
            </div>
          </div>

          {/* Comment Input Section */}
          <div className="bg-muted/30 p-4 sm:p-6">
            <div className="flex gap-4">
              <Avatar className="hidden h-9 w-9 sm:block">
                <AvatarImage src={userProfile?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {userProfile?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="What are your thoughts?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-25 resize-none border-muted-foreground/20 bg-background focus-visible:ring-1"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground hidden sm:inline-block">
                    Be kind and constructive.
                  </span>
                  <Button
                    disabled={!newComment.trim() || isSubmitting}
                    onClick={handleSubmitComment}
                    className="px-6 gap-2"
                  >
                    {isSubmitting ? (
                      <>Posting...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Comment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments Feed */}
          <div className="flex-1 px-4 py-6 sm:px-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">
                {comments.length}{' '}
                {comments.length === 1 ? 'Comment' : 'Comments'}
              </h3>
            </div>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading comments...
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-0">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
