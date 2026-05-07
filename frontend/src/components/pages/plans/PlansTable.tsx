import { formatNumber } from '@/utils/formatNumber';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Badge } from '../../ui/badge';
import { TableActions } from '@/components/shared/TableActions';
import { cn } from '@/lib/utils';
import type { IPlan } from '@/interfaces/Plan';

interface PlansTableProps {
  plans: IPlan[];
  prepareEdit: (plan: IPlan) => void;
  handleDelete?: (planId: number) => void;
  handleIsActive?: (planId: number) => void;
}

export function PlansTable({
  plans,
  prepareEdit,
  handleDelete,
  handleIsActive,
}: PlansTableProps) {
  return (
    <Table>
      <TableHeader className='bg-white/3'>
        <TableRow className='hover:bg-transparent border-white/5'>
          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 hidden md:table-cell w-0'>
            Id
          </TableHead>

          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 pl-4 md:pl-6 w-0'>
            <div className='xl:max-w-xs truncate'>Nome</div>
          </TableHead>

          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 hidden md:table-cell w-0'>
            Preço
          </TableHead>

          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 text-center w-0'>
            <span className='md:hidden'>Freq.</span>
            <span className='hidden md:inline'>Frequência Semanal</span>
          </TableHead>

          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 text-center w-0'>
            Status
          </TableHead>

          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 text-right pr-4 md:pr-6 w-0'>
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {plans.length > 0 ? (
          plans.map((plan) => (
            <TableRow
              key={plan.id}
              className='border-white/5 hover:bg-white/2 transition-colors group'
            >
              <TableCell className='py-4 text-zinc-500 font-mono text-xs hidden md:table-cell w-0'>
                #{plan.id}
              </TableCell>

              <TableCell className='font-bold text-zinc-100 py-4 pl-4 md:pl-6 align-middle w-0'>
                <div className='flex flex-col'>
                  <span className='xl:max-w-xs truncate'>{plan.name}</span>
                  <span className='text-[10px] text-zinc-500 md:hidden truncate max-w-30'>
                    R$ {formatNumber(plan.price)}
                  </span>
                </div>
              </TableCell>

              <TableCell className='font-medium text-zinc-300 tabular-nums hidden md:table-cell w-0'>
                <span className='whitespace-nowrap'>
                  R$ {formatNumber(plan.price)}
                </span>
              </TableCell>

              <TableCell className='text-center w-0'>
                <span className='inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-black uppercase whitespace-nowrap'>
                  <span className='md:hidden'>{plan.timesPerWeek}x</span>
                  <span className='hidden md:inline'>
                    {plan.timesPerWeek}x na semana
                  </span>
                </span>
              </TableCell>

              <TableCell className='text-center w-0'>
                <Badge
                  variant='outline'
                  className={cn(
                    'rounded-full px-3 py-0.5 border-none font-bold text-[10px] uppercase tracking-tighter shadow-[0_0_10px_rgba(0,0,0,0.2)]',
                    plan.isActive
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-zinc-800 text-zinc-500',
                  )}
                >
                  {plan.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>

              <TableCell className='text-right pr-4 md:pr-6 align-middle w-0'>
                <TableActions
                  isActive={plan.isActive}
                  id={plan.id ?? 0}
                  onHandleActive={() => plan.id && handleIsActive?.(plan.id)}
                  onDelete={() => plan.id && handleDelete?.(plan.id)}
                  onEdit={() => prepareEdit(plan)}
                  plan={plan}
                />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={6}
              className='text-center h-48 text-zinc-600 font-medium italic'
            >
              Nenhum plano encontrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
