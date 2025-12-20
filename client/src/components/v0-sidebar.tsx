'use client';

import { useState } from 'react';
import {
  Home,
  Flame,
  BookOpen,
  Users,
  Hash,
  ChevronDown,
  Code,
  Cpu,
  Palette,
  Building,
  GraduationCap,
  Trophy,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import React from 'react';

const categories = [
  {
    name: 'Academics',
    icon: GraduationCap,
    subforums: [
      { name: 'CSE Department', icon: Code },
      { name: 'EEE Department', icon: Cpu },
      { name: 'BBA Department', icon: Building },
      { name: 'Architecture', icon: Palette },
    ],
  },
  {
    name: 'Clubs & Orgs',
    icon: Users,
    subforums: [
      { name: 'ROBU', icon: Bot },
      { name: 'BUCC', icon: Code },
      { name: 'BUDbF', icon: Trophy },
      { name: 'Mongol Tori', icon: Users },
    ],
  },
];

const popularTags = [
  '#cse110',
  '#robotics_club',
  '#thesis',
  '#career',
  '#internship',
  '#events',
  '#help',
  '#memes',
];

export function Sidebar() {
  const [activeItem, setActiveItem] = useState('home');
  const [openCategories, setOpenCategories] = useState<string[]>(['Academics']);

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <aside className="hidden h-[calc(100vh-3.5rem)] w-64 flex-shrink-0 lg:block">
      <ScrollArea className="h-full py-4">
        <div className="space-y-4 px-3">
          {/* Main Navigation */}
          <div className="space-y-1">
            <Button
              variant={activeItem === 'home' ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => setActiveItem('home')}
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
            <Button
              variant={activeItem === 'trending' ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => setActiveItem('trending')}
            >
              <Flame className="h-4 w-4 text-orange-500" />
              Trending
            </Button>
            <Button
              variant={activeItem === 'following' ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => setActiveItem('following')}
            >
              <BookOpen className="h-4 w-4" />
              Following
            </Button>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </h3>
            {categories.map((category) => (
              <Collapsible
                key={category.name}
                open={openCategories.includes(category.name)}
                onOpenChange={() => toggleCategory(category.name)}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <span className="flex items-center gap-3">
                      <category.icon className="h-4 w-4" />
                      {category.name}
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        openCategories.includes(category.name) && 'rotate-180'
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-4 pt-1">
                  {category.subforums.map((subforum) => (
                    <Button
                      key={subforum.name}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                    >
                      <subforum.icon className="h-3 w-3" />
                      {subforum.name}
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>

          {/* Popular Tags */}
          <div className="space-y-2">
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Popular Tags
            </h3>
            <div className="flex flex-wrap gap-2 px-3">
              {popularTags.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-xs bg-transparent"
                >
                  <Hash className="h-3 w-3" />
                  {tag.replace('#', '')}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
