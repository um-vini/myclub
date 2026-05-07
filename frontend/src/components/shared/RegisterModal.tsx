import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogPortal, // Importado
  DialogOverlay, // Importado
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface RegisterModalProps {
  title: string;
  description: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
  onSubmit: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RegisterModal({
  title,
  description,
  trigger,
  children,
  onSubmit,
  open,
  onOpenChange,
}: RegisterModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogPortal>
        {/* Overlay */}
        <DialogOverlay className='fixed inset-0 z-90 bg-black/80 backdrop-blur-sm' />

        <DialogContent
          className={cn(
            // Base style and animation
            'fixed z-100 bg-zinc-950 flex flex-col outline-none duration-300',

            // MOBILE: Complete reset to full screen
            'inset-0 translate-x-0! translate-y-0 w-full! h-full! max-w-none! rounded-none border-none',

            // SMALL PC
            'lg:inset-auto lg:top-1/2 lg:left-1/2',
            'lg:-translate-x-1/2! lg:-translate-y-1/2!',
            'lg:w-full! lg:max-w-150! lg:max-h-[90vh] lg:rounded-2xl lg:border lg:border-white/10',

            // DESKTOP:
            '2xl:h-auto!',

            'overflow-hidden shadow-2xl',
          )}
        >
          <DialogHeader className='pb-6 md:py-6 md:pb-0 md:p-6'>
            <DialogTitle className='text-2xl font-bold tracking-tight text-white'>
              {title}
            </DialogTitle>
            <DialogDescription className='text-sm text-zinc-500 font-medium'>
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className='flex-1 overflow-y-auto space-y-6 px-1.5 md:px-0'>
            {children}
          </div>

          <DialogFooter className='pt-6 md:py-6 bg-zinc-950/80 backdrop-blur-md border-t border-white/5 sticky bottom-0 md:static md:bg-transparent md:border-none md:px-6'>
            <Button
              type='submit'
              onClick={onSubmit}
              className='w-full md:w-auto h-12 md:h-11 px-8 rounded-xl font-bold bg-emerald-500 text-emerald-950 hover:bg-emerald-400 transition-all'
            >
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
