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
import { Check, X, ClockFading, Loader2, Repeat } from 'lucide-react';
import type { IExpense } from '@/interfaces/Expense';
import { formatNumber } from '@/utils/formatNumber';
import { ConfirmAction } from '@/components/shared/ConfirmActions';

interface ExpensesTableProps {
  displayList: IExpense[];
  processingId: number | null;
  onMarkAsPaid: (expenseId: number) => void;
  prepareEdit: (expense: IExpense) => void;
  handleDelete: (expenseId: number) => void;
}

export function ExpensesTable({
  displayList,
  onMarkAsPaid,
  processingId,
  prepareEdit,
  handleDelete,
}: ExpensesTableProps) {
  const categoryMap: Record<string, string> = {
    utilities: 'Utilidades',
    rent: 'Aluguel',
    equipment: 'Equipamentos',
    salary: 'Salário',
    marketing: 'Marketing',
    other: 'Outros',
  };

  return (
    <Table>
      <TableHeader className='bg-white/3'>
        <TableRow className='hover:bg-transparent border-white/5 '>
          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 hidden lg:table-cell'>
            Vencimento
          </TableHead>
          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4'>
            Descrição
          </TableHead>
          <TableHead className='text-center text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 hidden md:table-cell'>
            Categoria
          </TableHead>
          <TableHead className='text-center text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 hidden md:table-cell'>
            Valor
          </TableHead>
          <TableHead className='text-center text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4'>
            Status
          </TableHead>
          <TableHead className='text-right text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 pr-4 md:pr-6'>
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayList.length > 0 ? (
          displayList.map((expense) => (
            <TableRow
              key={expense.id}
              className='border-white/5 hover:bg-white/2 transition-colors group'
            >
              <TableCell className='text-zinc-500 font-mono text-xs hidden lg:table-cell'>
                {new Date(expense.dueDate).toLocaleDateString('pt-BR')}
              </TableCell>

              <TableCell className='text-zinc-100 w-full lg:w-auto'>
                <div className='flex items-center gap-2 font-bold'>
                  {/* Limited text size on mobile */}
                  <p
                    className='truncate max-w-37.5 md:max-w-62.5 xl:max-w-xs'
                    title={expense.description}
                  >
                    {expense.description}
                  </p>
                  {expense.isRecurring && (
                    <span title='Conta recorrente'>
                      <Repeat className='h-3 w-3 shrink-0 text-rose-400/50 drop-shadow-[0_0_5px_rgba(251,113,133,0.3)]' />
                    </span>
                  )}
                </div>
                {/* Data no mobile */}
                <span className='text-zinc-500 font-mono text-[10px] lg:hidden'>
                  {new Date(expense.dueDate).toLocaleDateString('pt-BR')}
                </span>
              </TableCell>

              <TableCell className='text-center hidden md:table-cell'>
                <Badge
                  variant='outline'
                  className='font-black text-[9px] uppercase border-white/5 bg-white/5 text-zinc-400 rounded-md tracking-tighter'
                >
                  {categoryMap[expense.category] || expense.category}
                </Badge>
              </TableCell>

              <TableCell className='text-center hidden md:table-cell'>
                <span className='font-bold text-zinc-100 tabular-nums'>
                  R$ {formatNumber(expense.amount)}
                </span>
              </TableCell>

              <TableCell className='align-middle'>
                <div className='flex flex-col items-center gap-1 md:block'>
                  <span className='font-bold text-zinc-100 tabular-nums text-xs md:hidden'>
                    R$ {formatNumber(expense.amount)}
                  </span>

                  <div className='flex justify-center'>
                    {expense.status === 'paid' && (
                      <Badge
                        variant='paid'
                        className='w-24 justify-center bg-emerald-500/10 text-emerald-500 border-none rounded-full text-[10px] font-bold uppercase'
                      >
                        <Check className='mr-1.5 h-3 w-3' />
                        Pago
                      </Badge>
                    )}

                    {expense.status === 'pending' && (
                      <ConfirmAction
                        title='Confirmar Pagamento?'
                        description={`Deseja marcar a conta "${expense.description}" como paga?`}
                        onConfirm={() => onMarkAsPaid(expense.id!)}
                        variant='default'
                        trigger={
                          <Badge
                            variant='pending'
                            className='w-24 cursor-pointer justify-center bg-amber-500/10 text-amber-500 border-none rounded-full text-[10px] font-bold uppercase hover:bg-amber-500/20 transition-colors'
                          >
                            {processingId === expense.id ? (
                              <Loader2 className='animate-spin h-3 w-3' />
                            ) : (
                              <>
                                <ClockFading className='mr-1.5 h-3 w-3' />
                                Pendente
                              </>
                            )}
                          </Badge>
                        }
                      />
                    )}

                    {expense.status === 'overdue' && (
                      <ConfirmAction
                        title='Pagar Conta Atrasada?'
                        description={`A conta "${expense.description}" está vencida. Confirmar pagamento agora?`}
                        onConfirm={() => onMarkAsPaid(expense.id!)}
                        variant='default'
                        trigger={
                          <Badge
                            variant='overdue'
                            className='w-24 cursor-pointer justify-center bg-rose-500/10 text-rose-500 border-none rounded-full text-[10px] font-bold uppercase hover:bg-rose-500/20 transition-colors shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                          >
                            <X className='mr-1.5 h-3 w-3' />
                            Vencida
                          </Badge>
                        }
                      />
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell className='text-right pr-4 md:pr-6 align-middle'>
                <TableActions
                  id={expense.id!}
                  onEdit={() => prepareEdit(expense)}
                  onDelete={() => handleDelete(expense.id!)}
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
              Nenhuma despesa encontrada para este período.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
