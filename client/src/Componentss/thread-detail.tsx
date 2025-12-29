"use client"

import { useState } from "react"
import { ArrowUp, ArrowDown, MessageSquare, Share2, Bookmark, MoreHorizontal, ArrowLeft, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

const mockThread = {
  id: "1",
  title: "How to prepare for CSE110 midterm? Share your tips!",
  content: `Hey everyone! 👋

The CSE110 midterm is coming up next week and I'm looking for study tips from those who've already taken the course.

**Specific questions:**
1. What topics are most important to focus on?
2. Are past papers available anywhere?
3. How much time should I dedicate to practice problems vs theory?

Any advice would be greatly appreciated! Let's help each other out. 🎓`,
  author: {
    name: "Rafiq Ahmed",
    avatar: "/male-student-studying.png",
    role: "user" as const,
  },
  category: "CSE Department",
  tags: ["#cse110", "#study", "#help"],
  upvotes: 42,
  downvotes: 2,
  createdAt: "2 hours ago",
}

const mockComments = [
  {
    id: "c1",
    content:
      "Focus on loops and conditionals - they're heavily tested! I found the lecture slides super helpful for understanding the concepts. Also, try solving the exercises at the end of each chapter.",
    author: {
      name: "Sarah Khan",
      avatar: "/diverse-female-student.png",
      role: "moderator" as const,
    },
    upvotes: 15,
    downvotes: 0,
    createdAt: "1 hour ago",
    replies: [
      {
        id: "r1",
        content: "Agreed! The loop questions can be tricky. Make sure you can trace through code manually.",
        author: {
          name: "Tanvir Hossain",
          avatar: "/student-casual.jpg",
          role: "user" as const,
        },
        upvotes: 8,
        downvotes: 0,
        createdAt: "45 minutes ago",
      },
    ],
  },
  {
    id: "c2",
    content:
      "Past papers are available in the CSE department drive. Ask any senior for the link! The format hasn't changed much over the years.",
    author: {
      name: "Dr. Rahman",
      avatar: "/diverse-professor-lecturing.png",
      role: "admin" as const,
    },
    upvotes: 23,
    downvotes: 0,
    createdAt: "30 minutes ago",
    replies: [],
  },
]

const roleColors = {
  user: "bg-secondary text-secondary-foreground",
  moderator: "bg-blue-500/20 text-blue-400",
  admin: "bg-primary/20 text-primary",
}

export function ThreadDetail() {
  const [votes, setVotes] = useState(mockThread.upvotes - mockThread.downvotes)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const handleVote = (type: "up" | "down") => {
    if (userVote === type) {
      setUserVote(null)
      setVotes(mockThread.upvotes - mockThread.downvotes)
    } else {
      setUserVote(type)
      setVotes(mockThread.upvotes - mockThread.downvotes + (type === "up" ? 1 : -1))
    }
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="sticky top-14 z-40 border-b border-border bg-background/95 px-4 py-2 backdrop-blur">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Feed
          </Button>
        </Link>
      </div>

      {/* Thread Content */}
      <div className="p-4">
        <div className="flex gap-4">
          {/* Vote Column */}
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-10 w-10 rounded-full", userVote === "up" && "bg-primary/20 text-primary")}
              onClick={() => handleVote("up")}
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
            <span
              className={cn(
                "text-lg font-bold",
                userVote === "up" && "text-primary",
                userVote === "down" && "text-destructive",
              )}
            >
              {votes}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-10 w-10 rounded-full", userVote === "down" && "bg-destructive/20 text-destructive")}
              onClick={() => handleVote("down")}
            >
              <ArrowDown className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">
            {/* Author Info */}
            <div className="flex items-center gap-2 flex-wrap">
              <Avatar className="h-8 w-8">
                <AvatarImage src={mockThread.author.avatar || "/placeholder.svg"} alt={mockThread.author.name} />
                <AvatarFallback>{mockThread.author.name[0]}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{mockThread.author.name}</span>
              <Badge variant="secondary" className={cn("text-xs", roleColors[mockThread.author.role])}>
                {mockThread.author.role}
              </Badge>
              <span className="text-sm text-muted-foreground">in {mockThread.category}</span>
              <span className="text-sm text-muted-foreground">• {mockThread.createdAt}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold">{mockThread.title}</h1>

            {/* Content */}
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-foreground">{mockThread.content}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {mockThread.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="hover:bg-secondary cursor-pointer">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 border-t border-border pt-4">
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                {mockComments.length} comments
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn("gap-2", isBookmarked && "text-primary")}
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
                Save
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Report</DropdownMenuItem>
                  <DropdownMenuItem>Hide</DropdownMenuItem>
                  <DropdownMenuItem>Copy Link</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Comment Input */}
      <div className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/current-user.jpg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="What are your thoughts?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button disabled={!newComment.trim()} className="gap-2">
                <Send className="h-4 w-4" />
                Comment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Comments */}
      <div className="divide-y divide-border">
        {mockComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} replyingTo={replyingTo} setReplyingTo={setReplyingTo} />
        ))}
      </div>
    </div>
  )
}

interface CommentItemProps {
  comment: {
    id: string
    content: string
    author: {
      name: string
      avatar: string
      role: "user" | "moderator" | "admin"
    }
    upvotes: number
    downvotes: number
    createdAt: string
    replies: {
      id: string
      content: string
      author: {
        name: string
        avatar: string
        role: "user" | "moderator" | "admin"
      }
      upvotes: number
      downvotes: number
      createdAt: string
    }[]
  }
  replyingTo: string | null
  setReplyingTo: (id: string | null) => void
  isReply?: boolean
}

function CommentItem({ comment, replyingTo, setReplyingTo, isReply = false }: CommentItemProps) {
  const [votes, setVotes] = useState(comment.upvotes - comment.downvotes)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)
  const [replyText, setReplyText] = useState("")

  const handleVote = (type: "up" | "down") => {
    if (userVote === type) {
      setUserVote(null)
      setVotes(comment.upvotes - comment.downvotes)
    } else {
      setUserVote(type)
      setVotes(comment.upvotes - comment.downvotes + (type === "up" ? 1 : -1))
    }
  }

  return (
    <div className={cn("p-4", isReply && "ml-12 border-l border-border")}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
          <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{comment.author.name}</span>
            <Badge variant="secondary" className={cn("text-xs", roleColors[comment.author.role])}>
              {comment.author.role}
            </Badge>
            <span className="text-xs text-muted-foreground">• {comment.createdAt}</span>
          </div>
          <p className="text-sm">{comment.content}</p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 px-2", userVote === "up" && "text-primary")}
              onClick={() => handleVote("up")}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span
              className={cn(
                "text-sm font-medium",
                userVote === "up" && "text-primary",
                userVote === "down" && "text-destructive",
              )}
            >
              {votes}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 px-2", userVote === "down" && "text-destructive")}
              onClick={() => handleVote("down")}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              >
                Reply
              </Button>
            )}
          </div>

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="flex gap-2 pt-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[60px]"
              />
              <div className="flex flex-col gap-1">
                <Button size="sm" disabled={!replyText.trim()}>
                  Reply
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={{ ...reply, replies: [] }}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          isReply
        />
      ))}
    </div>
  )
}
