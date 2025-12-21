"use client"

import { Flame, TrendingUp, Users, Calendar } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

const trendingTopics = [
  { tag: "#cse370", posts: 45, trend: "+12" },
  { tag: "#inter_uni_hackathon", posts: 38, trend: "+8" },
  { tag: "#thesis_defense", posts: 32, trend: "+5" },
  { tag: "#spring_registration", posts: 28, trend: "+15" },
  { tag: "#robu_workshop", posts: 24, trend: "+10" },
]

const topContributors = [
  {
    name: "Dr. Mahbub",
    avatar: "/professor-male.jpg",
    role: "admin",
    points: 2450,
  },
  {
    name: "Nadia Islam",
    avatar: "/diverse-female-student.png",
    role: "moderator",
    points: 1890,
  },
  {
    name: "Karim Hasan",
    avatar: "/male-student-studying.png",
    role: "user",
    points: 1654,
  },
  {
    name: "Priya Das",
    avatar: "/female-professional.png",
    role: "moderator",
    points: 1432,
  },
]

const upcomingEvents = [
  {
    title: "ROBU Robotics Workshop",
    date: "Dec 21, 2024",
    time: "2:00 PM",
  },
  {
    title: "CSE Career Fair",
    date: "Dec 23, 2024",
    time: "10:00 AM",
  },
  {
    title: "Winter Break Begins",
    date: "Dec 25, 2024",
    time: "All Day",
  },
]

export function RightSidebar() {
  return (
    <aside className="hidden h-[calc(100vh-3.5rem)] w-80 flex-shrink-0 xl:block">
      <ScrollArea className="h-full py-4">
        <div className="space-y-4 px-4">
          {/* Trending Topics */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Flame className="h-4 w-4 text-orange-500" />
                Trending Now
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <div
                  key={topic.tag}
                  className="flex items-center justify-between cursor-pointer rounded-lg p-2 transition-colors hover:bg-secondary"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-primary">{topic.tag}</p>
                      <p className="text-xs text-muted-foreground">{topic.posts} posts</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs text-primary">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {topic.trend}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topContributors.map((user, index) => (
                <div
                  key={user.name}
                  className="flex items-center gap-3 cursor-pointer rounded-lg p-2 transition-colors hover:bg-secondary"
                >
                  <span className="w-5 text-center text-sm font-bold text-muted-foreground">{index + 1}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.points} points</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      user.role === "admin"
                        ? "border-primary/50 text-primary"
                        : user.role === "moderator"
                          ? "border-blue-500/50 text-blue-400"
                          : ""
                    }
                  >
                    {user.role}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.title}
                  className="rounded-lg border border-border p-3 transition-colors hover:bg-secondary cursor-pointer"
                >
                  <p className="text-sm font-medium">{event.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{event.date}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full bg-transparent" size="sm">
                View All Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </aside>
  )
}
