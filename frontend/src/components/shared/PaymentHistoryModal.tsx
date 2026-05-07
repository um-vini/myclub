import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface PaymentHistoryModalProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
}

export function PaymentHistoryModal({
  trigger,
  children,
}: PaymentHistoryModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogPortal>
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
            '2xl:max-h-auto!',

            'overflow-hidden shadow-2xl',
          )}
        >
          {/* sr-only keeps the header accessible for screen readers but hidden from UI */}
          <DialogHeader className='sr-only'>
            <DialogTitle>Atividade Financeira</DialogTitle>
            <DialogDescription>
              Histórico detalhado de pagamentos do aluno
            </DialogDescription>
          </DialogHeader>

          <div className='flex flex-col overflow-hidden h-full'>
            {children} {/* member activity content */}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
