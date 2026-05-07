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
  CommandIcon,
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
      avatar: user?.avatar || '/avatars/shadcn.jpg',
    },
    navMain: [
      {
        title: 'Mensalidades',
        url: '/payments',
        // Ícone com a cor do card de faturamento
        icon: <CalendarCheck className='size-4 text-emerald-400' />,
      },
      {
        title: 'Despesas',
        url: '/expenses',
        // Ícone com a cor do card de despesas
        icon: <Receipt className='size-4 text-rose-400' />,
      },
      {
        title: 'Alunos',
        url: '/members',
        icon: <UsersIcon className='size-4 text-blue-400' />,
      },
      {
        title: 'Planos',
        url: '/plans',
        icon: <CalendarDaysIcon className='size-4 text-purple-400' />,
      },
      {
        title: 'Usuários',
        url: '/users',
        icon: <UsersRound className='size-4 text-amber-400' />,
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
      <SidebarHeader className='border-b border-white/5 py-4'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='hover:bg-white/5 transition-colors'
            >
              <a href='/'>
                <div className='flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500'>
                  <CommandIcon className='size-5' />
                </div>
                <span className='text-lg font-bold tracking-tight text-white'>
                  MyClub
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className='gap-0 py-4'>
        {/* NavMain estilizado para ter um hover suave e bordas arredondadas */}
        <NavMain items={navData.navMain} />

        <NavSecondary items={navData.navSecondary} className='mt-auto' />
      </SidebarContent>

      <SidebarFooter className='border-t border-white/5 p-4'>
        <NavUser user={navData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
