import { Sidebar } from '@/components/ui/sidebar';
import {
  BookOpen,
  Bot,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { GalleryVerticalEnd } from 'lucide-react';

const data = {
  user: {
    name: 'Sharzil',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Departments',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'CSE',
          url: '#',
        },
        {
          title: 'EEE',
          url: '#',
        },
        {
          title: 'BBA',
          url: '#',
        },
        {
          title: 'Architecture',
          url: '#',
        },
      ],
    },
    {
      title: 'Clubs & Orgs',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'ROBU',
          url: '#',
        },
        {
          title: 'BUCC',
          url: '#',
        },
        {
          title: 'BUEDF',
          url: '#',
        },
        {
          title: 'MONGOL TORI',
          url: '#',
        },
      ],
    },
    {
      title: 'Advising',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Course Review',
          url: '#',
        },
        {
          title: 'Faculty Review',
          url: '#',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#',
        },
        {
          title: 'Team',
          url: '#',
        },
        {
          title: 'Billing',
          url: '#',
        },
        {
          title: 'Limits',
          url: '#',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoy,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Send,
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="md:hidden" size="lg" asChild>
              <a href="#">
                <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">BRACU Forum</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
