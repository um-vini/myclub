import { SidebarInset, SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import { TooltipProvider } from '../ui/tooltip';
import { AppSidebar } from '../navigation/app-sidebar';
import { Outlet } from 'react-router-dom';

import { ChevronLeft, ChevronRight, MenuIcon } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '../ui/button';

interface MainLayoutProps {
  children?: React.ReactNode;
}

function CustomTrigger() {
  const { open, toggleSidebar } = useSidebar();

  return (
    <>
      <div className='absolute top-6 right-6 lg:top-23 lg:left-1 z-50 hidden lg:block '>
        <Button
          variant='outline'
          size='icon'
          onClick={toggleSidebar}
          className='h-6 w-6 rounded-2xl shadow-sm hover:bg-zinc-900 transition-all bg-transparent! border-0'
        >
          {open ? (
            <ChevronLeft className='size-3.5 text-zinc-400' />
          ) : (
            <ChevronRight className='size-3.5 text-zinc-400' />
          )}
          <span className='sr-only'>Toggle Sidebar</span>
        </Button>
      </div>

      <div className='absolute top-3 right-4 lg:top-23 lg:left-1 z-50 lg:hidden'>
        <Button
          variant='outline'
          size='icon'
          onClick={toggleSidebar}
          className='h-12 w-fit rounded-md border-0 bg-transparent! hover:bg-zinc-900 transition-all'
        >
          {open && <MenuIcon className='size-6 text-zinc-200' />}
          <span className='sr-only'>Toggle Sidebar</span>
        </Button>
      </div>
    </>
  );
}

/**
 * Primary layout wrapper for authenticated pages.
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        {/* Navigation sidebar */}
        <AppSidebar />

        <SidebarInset className='relative'>
          <CustomTrigger />

          {/* Main header with sidebar toggle button */}
          <header className='h-16 shrink-0 items-center gap-2 border-b px-6 hidden'>
            <SidebarTrigger />
            <div className='ml-2 font-medium'>MyClub</div>
          </header>

          {/* Main content area */}
          <Outlet />

          <main className='flex flex-1 flex-col gap-4 px-2'>{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
