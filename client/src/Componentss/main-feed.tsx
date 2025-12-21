"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThreadCard } from "./thread-card"
import { PollCard } from "./poll-card"
import { CreateThreadDialog } from "./create-thread-dialog"

const mockThreads = [
  {
    id: "1",
    title: "How to prepare for CSE110 midterm? Share your tips!",
    content:
      "Hey everyone! The midterm is coming up next week and I'm looking for study tips. What resources have you found helpful? Any particular topics to focus on?",
    author: {
      name: "Rafiq Ahmed",
      avatar: "/male-student-studying.png",
      role: "user" as const,
    },
    category: "CSE Department",
    tags: ["#cse110", "#study", "#help"],
    upvotes: 42,
    downvotes: 2,
    comments: 15,
    createdAt: "2 hours ago",
    isPinned: true,
  },
  {
    id: "2",
    title: "ROBU is hosting a robotics workshop this Saturday!",
    content:
      "Join us for an exciting hands-on robotics workshop where we'll be building line-following robots. All materials will be provided. Registration link in the comments!",
    author: {
      name: "Sarah Khan",
      avatar: "/diverse-female-student.png",
      role: "moderator" as const,
    },
    category: "ROBU",
    tags: ["#robotics_club", "#events", "#workshop"],
    upvotes: 89,
    downvotes: 0,
    comments: 23,
    createdAt: "5 hours ago",
    isPinned: false,
  },
  {
    id: "3",
    title: "Looking for thesis partner - Machine Learning focused",
    content:
      "I'm currently in my final year looking for a thesis partner interested in ML/AI topics. My areas of interest include NLP and computer vision. DM if interested!",
    author: {
      name: "Admin User",
      avatar: "/admin-avatar.png",
      role: "admin" as const,
    },
    category: "CSE Department",
    tags: ["#thesis", "#machine_learning", "#collaboration"],
    upvotes: 34,
    downvotes: 1,
    comments: 8,
    createdAt: "1 day ago",
    isPinned: false,
  },
  {
    id: "4",
    title: "Best cafeteria food on campus? Let's discuss!",
    content:
      "I've been trying different options around campus. The new Thai place near UB2 is pretty good! What are your favorite spots?",
    author: {
      name: "Tanvir Hossain",
      avatar: "/student-casual.jpg",
      role: "user" as const,
    },
    category: "General",
    tags: ["#campus_life", "#food"],
    upvotes: 56,
    downvotes: 5,
    comments: 42,
    createdAt: "2 days ago",
    isPinned: false,
  },
]

const mockPoll = {
  id: "poll-1",
  question: "Which programming language should be taught first to freshers?",
  options: [
    { id: "1", text: "Python", votes: 145 },
    { id: "2", text: "C/C++", votes: 89 },
    { id: "3", text: "Java", votes: 67 },
    { id: "4", text: "JavaScript", votes: 34 },
  ],
  author: {
    name: "Dr. Rahman",
    avatar: "/diverse-professor-lecturing.png",
    role: "admin" as const,
  },
  totalVotes: 335,
  createdAt: "3 hours ago",
  endsAt: "2 days left",
}

export function MainFeed() {
  const [activeTab, setActiveTab] = useState("latest")

  return (
    <div className="min-h-screen">
      <div className="sticky top-14 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between">
              <TabsList className="bg-transparent">
                <TabsTrigger value="latest" className="data-[state=active]:bg-secondary">
                  Latest
                </TabsTrigger>
                <TabsTrigger value="trending" className="data-[state=active]:bg-secondary">
                  Trending
                </TabsTrigger>
                <TabsTrigger value="top" className="data-[state=active]:bg-secondary">
                  Top
                </TabsTrigger>
              </TabsList>
              <CreateThreadDialog />
            </div>
          </Tabs>
        </div>
      </div>

      <div className="divide-y divide-border">
        {/* Featured Poll */}
        <PollCard poll={mockPoll} />

        {/* Threads */}
        {mockThreads.map((thread) => (
          <ThreadCard key={thread.id} thread={thread} />
        ))}
      </div>
    </div>
  )
}
