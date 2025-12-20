'use client';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { BookOpen, ChevronRight, Flame, Home } from 'lucide-react';
import { useState } from 'react';

export function NavMain({ items }) {
  const [activeItem, setActiveItem] = useState('home');

  return (
    <SidebarGroup>
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
              <Flame className="h-4 w-4 text-orange-500 dark:text-orange-400" />
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
        </div>
      </ScrollArea>
      <SidebarGroupLabel>Categories</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
