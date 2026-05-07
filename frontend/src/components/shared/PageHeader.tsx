import type { ReactNode } from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps extends React.ComponentProps<'div'> {
  title: string;
  badge?: ReactNode;
  description?: string;
  buttonText?: string;
  buttonIcon?: ReactNode;
  onButtonClick?: () => void;
}

export function PageHeader({
  title,
  badge,
  buttonText,
  buttonIcon,
  onButtonClick,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        // Mobile:
        'flex flex-col gap-4 items-start pb-6 mb-6 border-b border-white/5',
        // Desktop:
        'md:flex-row md:items-end md:justify-between md:gap-0',
        className,
      )}
      {...props}
    >
      <div className='space-y-1 w-full '>
        <div className='flex items-center gap-3  w-fit'>
          {badge}
          <h1 className='text-2xl md:text-3xl font-bold tracking-tight text-white'>
            {title}
          </h1>
        </div>
      </div>

      {buttonText && (
        <Button
          variant='ghost'
          onClick={(e) => {
            e.stopPropagation(); //  Prevents the click to propagate to the parent
            onButtonClick?.();
          }}
          className={cn(
            // Mobile: Full width btn
            'w-full md:w-auto h-12 px-4 gap-3 rounded-xl transition-all duration-300',
            'bg-white/5 md:bg-transparent text-muted-foreground hover:text-white hover:bg-white/5',
            'group/header-btn active:scale-95',
          )}
        >
          <div className='transition-all duration-300 group-hover/header-btn:scale-110 group-hover/header-btn:drop-shadow-[0_0_8px_currentColor]'>
            {buttonIcon}
          </div>

          <span className='text-sm font-medium tracking-wide'>
            {buttonText}
          </span>
        </Button>
      )}
    </div>
  );
}
