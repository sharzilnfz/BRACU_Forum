import { SidebarIcon } from 'lucide-react';

import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { InputWithButton } from '@/components/ui/searchForm';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';
import { StatefulButtonDemo } from '@/components/uploadbutton';
import { GalleryVerticalEnd } from 'lucide-react';

import {CreateThreadDialog} from '@/components/dialog';
export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>

        <Separator orientation="vertical" className="mr-2 h-4" />
        {/* <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">
                Building Your Application
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb> */}
        {/* <SearchForm className="w-full sm:ml-auto sm:w-auto" /> */}
        <div className="hidden md:flex items-center gap-2 w-2/3">
          <a href="#" className="flex items-center gap-2 w-full">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-5" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">BRACU Forum</span>
              <span className="truncate text-xs">Enterprise</span>
            </div>
          </a>
        </div>
        {/* <div className="w-full flex justify-end sm:w-2/5"> */}
          {/* <StatefulButtonDemo /> */}
          <CreateThreadDialog />
          {/* <PopoverDemo />  */}
        {/* </div> */}
        <InputWithButton className="w-full sm:ml-auto sm:w-auto md:w-2/3" />
        <ModeToggle />
      </div>
    </header>
  );
}
