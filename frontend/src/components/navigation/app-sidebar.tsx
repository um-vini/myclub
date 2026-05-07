import * as React from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useContext } from 'react';
import { NavMain } from '@/components/navigation/nav-main';
import { NavSecondary } from '@/components/navigation/nav-secondary';
import { NavUser } from '@/components/navigation/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  UsersIcon,
  CalendarDaysIcon,
  UsersRound,
  Receipt,
  CalendarCheck,
} from 'lucide-react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useContext(AuthContext);

  const navData = {
    user: {
      name: user?.name || 'Convidado',
      email: user?.email || 'sem e-mail',
      avatar: '/user.svg',
    },
    navMain: [
      {
        title: 'Mensalidades',
        url: '/payments',
        icon: (
          <CalendarCheck className='size-4 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]' />
        ),
      },
      {
        title: 'Despesas',
        url: '/expenses',
        icon: (
          <Receipt className='size-4 text-rose-400 drop-shadow-[0_0_5px_rgba(251,113,133,0.3)]' />
        ),
      },
      {
        title: 'Alunos',
        url: '/members',
        icon: (
          <UsersIcon className='size-4 text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.3)]' />
        ),
      },
      {
        title: 'Planos',
        url: '/plans',
        icon: (
          <CalendarDaysIcon className='size-4 text-purple-400 drop-shadow-[0_0_5px_rgba(192,132,252,0.3)]' />
        ),
      },
      {
        title: 'Usuários',
        url: '/users',
        icon: (
          <UsersRound className='size-4 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]' />
        ),
      },
    ],
    navSecondary: [],
  };

  return (
    <Sidebar
      collapsible='offcanvas'
      {...props}
      className='border-r border-white/5 bg-neutral-950/80 backdrop-blur-xl'
    >
      <SidebarHeader className='border-b border-white/5 py-6'>
        {' '}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='h-auto hover:bg-transparent group/logo '
            >
              <a href='/' className='flex items-center gap-4 px-2 pt-3'>
                <div className='flex size-9 items-center justify-center rounded-xl bg-blue-500-500/10 text-blue-500-500 transition-all duration-300 group-hover/logo:scale-110 '>
                  <img src='/favicon.svg' alt='' />
                </div>

                <div className='flex flex-col'>
                  <span className='text-lg font-bold tracking-tight text-white leading-none'>
                    MyClub
                  </span>

                  <span className='text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-medium mt-1'>
                    Management
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className='gap-0 py-4'>
        <NavMain items={navData.navMain} />
        <NavSecondary items={navData.navSecondary} className='mt-auto' />
      </SidebarContent>

      <SidebarFooter className='border-t border-white/5 p-4 bg-white/1'>
        <NavUser user={navData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
