import { Link, useLocation } from 'react-router-dom';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
  }[];
}) {
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupContent className='flex flex-col gap-2'>
        <SidebarMenu className='gap-2'>
          {items.map((item) => {
            const isActive = pathname === item.url;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={cn(
                    'relative h-11 transition-all duration-300 group/menu-item',
                    'hover:bg-transparent',
                    isActive ? 'text-white' : 'text-muted-foreground/70',
                  )}
                >
                  <Link
                    to={item.url}
                    className='flex items-center gap-4 px-4'
                    onClick={() => setOpenMobile(false)}
                  >
                    <div
                      className={cn(
                        'transition-transform duration-300 group-hover/menu-item:scale-110',
                        isActive
                          ? 'opacity-100'
                          : 'opacity-70 group-hover/menu-item:opacity-100',
                      )}
                    >
                      {item.icon}
                    </div>
                    <span
                      className={cn(
                        'text-sm font-medium transition-all duration-300 tracking-wide',
                        isActive
                          ? 'text-white translate-x-1'
                          : 'group-hover/menu-item:text-white group-hover/menu-item:translate-x-1',
                      )}
                    >
                      {item.title}
                    </span>
                    {isActive && (
                      <div
                        className='absolute left-0 h-6 w-0.75 rounded-r-full bg-current shadow-[0_0_10px_0_currentColor] animate-in fade-in slide-in-from-left-2'
                        style={{ color: 'inherit' }}
                      />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
