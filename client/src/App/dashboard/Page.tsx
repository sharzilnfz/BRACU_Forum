import { AppSidebar } from '@/components/app-sidebar';
import { ThreadCard } from '@/components/card';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';

export const iframeHeight = '800px';

export const description = 'A sidebar with a header and a search form.';

export default function Page() {
  const posts = [
    {
      id: 1,
      author: {
        name: 'O. Dominic',
        handle: 'orimdominic_',
        avatarUrl: 'https://github.com/shadcn.png', // Demo avatar
      },
      date: 'Dec 10',
      content:
        "When you use react-hook-form, how do you reset the form state after submitting the form?\n\nform.reset doesn't seem to work.",
      stats: {
        replies: 1,
        reposts: 0,
        likes: 3,
        views: 391,
      },
    },
    {
      id: 2,
      author: {
        name: 'Sharzil Nafis',
        handle: 'sharzil',
        avatarUrl: 'https://github.com/sharzilnafis.png',
      },
      date: '2h',
      content:
        'Just finished building a new component with Tailwind CSS and Radix UI. The developer experience is amazing! \n\n#webdev #react #tailwindcss',
      stats: {
        replies: 12,
        reposts: 5,
        likes: 42,
        views: '1.2k',
      },
    },
    {
      id: 3,
      author: {
        name: 'Web Dev Daily',
        handle: 'webdevdaily',
        avatarUrl: '', // Fallback
      },
      date: '5h',
      content:
        'What is your favorite React state management library in 2024? Redux Toolkit, Zustand, Jotai, or Context API?',
      stats: {
        replies: 89,
        reposts: 34,
        likes: 256,
        views: '5.4k',
      },
    },
  ];
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col" style={undefined}>
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="">
            <div className="flex flex-1 flex-col gap-4 p-4">
              {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="bg-muted/50 aspect-video rounded-xl" />
                <div className="bg-muted/50 aspect-video rounded-xl" />
                <div className="bg-muted/50 aspect-video rounded-xl" />
              </div> */}
              <div className="flex-1 rounded-xl">
                {posts.map((post) => (
                  <ThreadCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
