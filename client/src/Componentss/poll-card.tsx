"use client"

import { useState } from "react"
import { BarChart3, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface PollCardProps {
  poll: {
    id: string
    question: string
    options: { id: string; text: string; votes: number }[]
    author: {
      name: string
      avatar: string
      role: "user" | "moderator" | "admin"
    }
    totalVotes: number
    createdAt: string
    endsAt: string
  }
}

export function PollCard({ poll }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)

  const handleVote = () => {
    if (selectedOption) {
      setHasVoted(true)
    }
  }

  return (
    <Card className="rounded-none border-0 border-b bg-secondary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            Poll
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {poll.endsAt}
          </span>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={poll.author.avatar || "/placeholder.svg"} alt={poll.author.name} />
            <AvatarFallback>{poll.author.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{poll.author.name}</span>
          <span className="text-xs text-muted-foreground">• {poll.createdAt}</span>
        </div>
        <h3 className="text-lg font-semibold pt-2">{poll.question}</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {poll.options.map((option) => {
          const percentage = Math.round((option.votes / poll.totalVotes) * 100)
          const isSelected = selectedOption === option.id

          return (
            <button
              key={option.id}
              onClick={() => !hasVoted && setSelectedOption(option.id)}
              disabled={hasVoted}
              className={cn(
                "relative w-full rounded-lg border p-3 text-left transition-all",
                isSelected && !hasVoted && "border-primary bg-primary/10",
                !isSelected && !hasVoted && "border-border hover:border-primary/50",
                hasVoted && "cursor-default",
              )}
            >
              {hasVoted && <Progress value={percentage} className="absolute inset-0 h-full rounded-lg opacity-20" />}
              <div className="relative flex items-center justify-between">
                <span className={cn("font-medium", isSelected && "text-primary")}>{option.text}</span>
                {hasVoted && (
                  <span className="text-sm text-muted-foreground">
                    {percentage}% ({option.votes} votes)
                  </span>
                )}
              </div>
            </button>
          )
        })}

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">{poll.totalVotes} total votes</span>
          {!hasVoted && (
            <Button onClick={handleVote} disabled={!selectedOption} size="sm">
              Vote
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
