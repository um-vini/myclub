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

import type { DisplayMember } from '@/interfaces/Member';
import { Check, X, ClockFading, Loader2 } from 'lucide-react';
import type { IPayment } from '@/interfaces/Payment';
import { formatNumber } from '@/utils/formatNumber';
import { ConfirmAction } from '@/components/shared/ConfirmActions';
import { formatNameMobile } from '@/utils/formatName';

interface PaymentsTableProps {
  displayList: DisplayMember[];
  processingId: number | null;
  selectedMonth?: number;
  onMarkAsPaid: (memberId: number) => void;
  prepareEdit: (payment: IPayment) => void;
  handleDelete?: (paymentId: number) => void;
  handleCancel?: (paymentId: number) => void;
  handleNew: (memberId: number) => void;
}

export function PaymentsTable({
  displayList,
  onMarkAsPaid,
  processingId,
  prepareEdit,
  handleCancel,
  handleNew,
  selectedMonth,
}: PaymentsTableProps) {
  return (
    <Table>
      <TableHeader className='bg-white/3'>
        <TableRow className='hover:bg-transparent border-white/5'>
          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 pl-4 md:pl-6'>
            Aluno
          </TableHead>
          <TableHead className='text-center text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 hidden lg:table-cell'>
            Vencimento
          </TableHead>
          <TableHead className='text-right text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 hidden lg:table-cell'>
            Valor Plano
          </TableHead>
          <TableHead className='text-right text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 hidden md:table-cell'>
            Valor Pago
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
          displayList.map((member) => (
            <TableRow
              key={member.id}
              className='border-white/5 hover:bg-white/2 transition-colors group'
            >
              <TableCell className='font-bold text-zinc-100 py-4 pl-4 md:pl-6 align-middle w-0'>
                <div className='flex flex-col'>
                  <span className='md:hidden text-sm'>
                    {formatNameMobile(member.name)}
                  </span>

                  <div className='hidden md:block xl:max-w-xs truncate'>
                    {member.name}
                  </div>

                  <span className='text-[10px] text-zinc-500 font-mono'>
                    {member.cpf
                      ? member.cpf.replace(
                          /(\d{3})(\d{3})(\d{3})(\d{2})/,
                          '$1.$2.$3-$4',
                        )
                      : 'Sem CPF'}
                  </span>
                </div>
              </TableCell>
              <TableCell className='text-center hidden lg:table-cell'>
                <span className='inline-flex items-center justify-center w-fit py-1 px-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-zinc-300'>
                  {member.dueDay} / {selectedMonth}
                </span>
              </TableCell>
              <TableCell className='text-right text-zinc-500 tabular-nums font-medium hidden lg:table-cell'>
                R$ {formatNumber(member.plan?.price ?? 0)}
              </TableCell>
              <TableCell className='text-right font-black text-white tabular-nums hidden md:table-cell'>
                {member.payment?.status === 'paid' ? (
                  'R$ ' + formatNumber(member.payment.amountPaid)
                ) : (
                  <span className='text-zinc-800'>—</span>
                )}
              </TableCell>
              <TableCell>
                <div className='flex justify-center'>
                  {/* Paid status badge */}
                  {member.paymentStatus === 'paid' && (
                    <Badge
                      variant='paid'
                      className='w-28 justify-center bg-emerald-500/10 text-emerald-500 border-none rounded-full text-[10px] font-bold uppercase'
                    >
                      <Check className='mr-1.5 h-3 w-3' />
                      Pago
                    </Badge>
                  )}

                  {/* Pending status badge with quick pay action */}
                  {member.paymentStatus === 'pending' && (
                    <ConfirmAction
                      title='Confirmar Pagamento?'
                      description={`Deseja marcar a mensalidade de ${member.name} como paga?`}
                      onConfirm={() => onMarkAsPaid(member.id!)}
                      variant='default'
                      trigger={
                        <Badge
                          variant='pending'
                          className='w-28 cursor-pointer justify-center bg-amber-500/10 text-amber-500 border-none rounded-full text-[10px] font-bold uppercase hover:bg-amber-500/20 transition-colors'
                        >
                          {processingId === member.id ? (
                            <>
                              <Loader2 className='animate-spin h-3 w-3 mr-1.5' />
                              Salvando
                            </>
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

                  {/* Overdue status badge with quick pay action */}
                  {member.paymentStatus === 'overdue' && (
                    <ConfirmAction
                      title='Receber Pagamento Atrasado?'
                      description={`O aluno ${member.name} está com a mensalidade atrasada. Confirmar o recebimento agora?`}
                      onConfirm={() => onMarkAsPaid(member.id!)}
                      variant='default'
                      trigger={
                        <Badge
                          variant='overdue'
                          className='w-28 cursor-pointer justify-center bg-rose-500/10 text-rose-400 border-none rounded-full text-[10px] font-bold uppercase hover:bg-rose-500/20 transition-colors shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                        >
                          {processingId === member.id ? (
                            <>
                              <Loader2 className='animate-spin h-3 w-3 mr-1.5' />
                              Salvando
                            </>
                          ) : (
                            <>
                              <X className='mr-1.5 h-3 w-3' />
                              Atrasado
                            </>
                          )}
                        </Badge>
                      }
                    />
                  )}
                </div>
              </TableCell>
              <TableCell className='text-right pr-4 md:pr-6'>
                <TableActions
                  id={member.id!}
                  onNew={
                    !member.payment ? () => handleNew(member.id!) : undefined
                  }
                  onCancel={
                    member.payment
                      ? () => handleCancel?.(member.payment!.id!)
                      : undefined
                  }
                  onEdit={
                    member.payment
                      ? () => prepareEdit(member.payment!)
                      : undefined
                  }
                  member={member}
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
              Nenhum registro encontrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
