"use client"

import { useState } from "react"
import { ArrowUp, ArrowDown, MessageSquare, Share2, Bookmark, MoreHorizontal, Pin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card } from "@/components/ui/card"

interface ThreadCardProps {
  thread: {
    id: string
    title: string
    content: string
    author: {
      name: string
      avatar: string
      role: "user" | "moderator" | "admin"
    }
    category: string
    tags: string[]
    upvotes: number
    downvotes: number
    comments: number
    createdAt: string
    isPinned: boolean
  }
}

const roleColors = {
  user: "bg-secondary text-secondary-foreground",
  moderator: "bg-blue-500/20 text-blue-400",
  admin: "bg-primary/20 text-primary",
}

export function ThreadCard({ thread }: ThreadCardProps) {
  const [votes, setVotes] = useState(thread.upvotes - thread.downvotes)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const handleVote = (type: "up" | "down") => {
    if (userVote === type) {
      setUserVote(null)
      setVotes(thread.upvotes - thread.downvotes)
    } else {
      setUserVote(type)
      setVotes(thread.upvotes - thread.downvotes + (type === "up" ? 1 : -1))
    }
  }

  return (
    <Card className="rounded-none border-0 border-b bg-transparent p-4 transition-colors hover:bg-secondary/30">
      <div className="flex gap-3">
        {/* Vote Column */}
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 rounded-full", userVote === "up" && "bg-primary/20 text-primary")}
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
            size="icon"
            className={cn("h-8 w-8 rounded-full", userVote === "down" && "bg-destructive/20 text-destructive")}
            onClick={() => handleVote("down")}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Column */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Avatar className="h-6 w-6">
                <AvatarImage src={thread.author.avatar || "/placeholder.svg"} alt={thread.author.name} />
                <AvatarFallback>{thread.author.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{thread.author.name}</span>
              <Badge variant="secondary" className={cn("text-xs", roleColors[thread.author.role])}>
                {thread.author.role}
              </Badge>
              <span className="text-xs text-muted-foreground">in {thread.category}</span>
              <span className="text-xs text-muted-foreground">• {thread.createdAt}</span>
              {thread.isPinned && (
                <Badge variant="outline" className="gap-1 text-xs text-primary">
                  <Pin className="h-3 w-3" />
                  Pinned
                </Badge>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
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

          {/* Title */}
          <h3 className="text-lg font-semibold leading-tight hover:text-primary cursor-pointer">{thread.title}</h3>

          {/* Content Preview */}
          <p className="text-sm text-muted-foreground line-clamp-2">{thread.content}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {thread.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs hover:bg-secondary cursor-pointer">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              {thread.comments} comments
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("gap-2", isBookmarked ? "text-primary" : "text-muted-foreground")}
              onClick={() => setIsBookmarked(!isBookmarked)}
            >
              <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
              Save
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
