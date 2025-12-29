"use client"

import { useState } from "react"
import { Calendar, MapPin, LinkIcon, Edit, Settings, Award, MessageSquare, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThreadCard } from "./thread-card"

const mockUser = {
  name: "John Doe",
  username: "@johndoe",
  avatar: "/diverse-student-profiles.png",
  role: "moderator" as const,
  bio: "CSE Student at BRAC University | Passionate about AI/ML | ROBU Member | Class of 2025",
  location: "Dhaka, Bangladesh",
  website: "johndoe.dev",
  joinedDate: "September 2022",
  stats: {
    posts: 45,
    comments: 234,
    karma: 1890,
  },
  badges: [
    { name: "Top Contributor", icon: Award },
    { name: "Helpful", icon: Heart },
    { name: "Active Commenter", icon: MessageSquare },
  ],
}

const mockUserThreads = [
  {
    id: "u1",
    title: "My experience with the CSE470 course - Tips and Resources",
    content:
      "Just completed CSE470 and wanted to share my experience. The course covers software engineering principles...",
    author: {
      name: "John Doe",
      avatar: "/diverse-student-profiles.png",
      role: "moderator" as const,
    },
    category: "CSE Department",
    tags: ["#cse470", "#tips", "#resources"],
    upvotes: 67,
    downvotes: 2,
    comments: 23,
    createdAt: "1 week ago",
    isPinned: false,
  },
  {
    id: "u2",
    title: "Looking for study group partners for upcoming finals",
    content: "Anyone interested in forming a study group for the upcoming finals? Planning to meet at the library...",
    author: {
      name: "John Doe",
      avatar: "/diverse-student-profiles.png",
      role: "moderator" as const,
    },
    category: "General",
    tags: ["#study", "#finals", "#collaboration"],
    upvotes: 34,
    downvotes: 0,
    comments: 15,
    createdAt: "2 weeks ago",
    isPinned: false,
  },
]

const roleColors = {
  user: "bg-secondary text-secondary-foreground",
  moderator: "bg-blue-500/20 text-blue-400",
  admin: "bg-primary/20 text-primary",
}

export function UserProfile() {
  const [activeTab, setActiveTab] = useState("posts")

  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <div className="border-b border-border">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 sm:h-48" />

        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="relative -mt-16 flex flex-col gap-4 sm:-mt-20 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <Avatar className="h-24 w-24 border-4 border-background sm:h-32 sm:w-32">
                <AvatarImage src={mockUser.avatar || "/placeholder.svg"} alt={mockUser.name} />
                <AvatarFallback className="text-2xl">{mockUser.name[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{mockUser.name}</h1>
                  <Badge variant="secondary" className={roleColors[mockUser.role]}>
                    {mockUser.role}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{mockUser.username}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bio */}
          <p className="mt-4 text-sm">{mockUser.bio}</p>

          {/* Meta Info */}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {mockUser.location}
            </span>
            <span className="flex items-center gap-1">
              <LinkIcon className="h-4 w-4" />
              <a href={`https://${mockUser.website}`} className="text-primary hover:underline">
                {mockUser.website}
              </a>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {mockUser.joinedDate}
            </span>
          </div>

          {/* Stats */}
          <div className="mt-4 flex gap-6">
            <div className="text-center">
              <p className="text-xl font-bold">{mockUser.stats.posts}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">{mockUser.stats.comments}</p>
              <p className="text-xs text-muted-foreground">Comments</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{mockUser.stats.karma}</p>
              <p className="text-xs text-muted-foreground">Karma</p>
            </div>
          </div>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            {mockUser.badges.map((badge) => (
              <Badge key={badge.name} variant="outline" className="gap-1">
                <badge.icon className="h-3 w-3" />
                {badge.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
          <TabsTrigger
            value="posts"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="comments"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Comments
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Saved
          </TabsTrigger>
          <TabsTrigger
            value="upvoted"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Upvoted
          </TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-0 divide-y divide-border">
          {mockUserThreads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </TabsContent>
        <TabsContent value="comments" className="p-4">
          <Card className="bg-secondary/30">
            <CardContent className="p-6 text-center text-muted-foreground">
              User&apos;s comments will appear here
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="saved" className="p-4">
          <Card className="bg-secondary/30">
            <CardContent className="p-6 text-center text-muted-foreground">Saved posts will appear here</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="upvoted" className="p-4">
          <Card className="bg-secondary/30">
            <CardContent className="p-6 text-center text-muted-foreground">Upvoted posts will appear here</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
