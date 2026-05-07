import type { IMember } from '@/interfaces/Member';
import type { IPayment } from '@/interfaces/Payment';
import { api } from '@/services/api';
import { formatNumber } from '@/utils/formatNumber';
import { useEffect, useMemo, useState } from 'react';
import { formatShortDate } from '../../utils/formatShortDate';
import type { IPlan } from '@/interfaces/Plan';
import { handleApiError } from '@/utils/handleApiError';
import { formatNameMobile } from '@/utils/formatName';

interface MemberActivityProps {
  memberId: number | undefined;
}

export function MemberActivity({ memberId }: MemberActivityProps) {
  // Core data states
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [member, setMember] = useState<IMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<IPlan[]>([]);

  // Find the specific plan for the current member
  const plan = plans.find((e) => e.id === member?.planId);

  const monthsBR = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  // Formatting registration date for the header display (e.g., Abr/2026)
  const registrationDate = member?.createdAt
    ? new Date(member.createdAt).toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      })
    : '';

  const formattedDate = registrationDate
    ? registrationDate.replace('.', '').charAt(0).toUpperCase() +
      registrationDate.replace('.', '').slice(1).replace(' de ', '/')
    : '';

  // Calculating member total lifetime value
  const totalPaid = payments.reduce((acc, payment) => {
    if (payment.status === 'paid') {
      // Make shure that is always a number
      const value = Number(payment.amountPaid) || 0;
      return acc + value;
    }
    return acc;
  }, 0);

  // Generate timeline history from join date to current month or latest payment
  const historyList = useMemo(() => {
    if (!member) return [];

    const results = [];
    const startDate = new Date(member.createdAt);
    const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    const today = new Date();
    const absCurrent = today.getFullYear() * 12 + today.getMonth();

    const absPayments = payments.map((p) => p.year * 12 + (p.month - 1));
    const maxPayment = absPayments.length > 0 ? Math.max(...absPayments) : 0;

    // Ensure to show up the furthest point (either today or an advanced payment)
    const limitAbs = Math.max(absCurrent, maxPayment);

    while (cursor.getFullYear() * 12 + cursor.getMonth() <= limitAbs) {
      const m = cursor.getMonth() + 1;
      const y = cursor.getFullYear();

      // Filter all payments realized in the month (including cancelled)
      const monthPayments = payments.filter(
        (p) => p.month === m && p.year === y,
      );

      const hasPaid = monthPayments.some((p) => p.status === 'paid');

      let status: 'paid' | 'overdue' | 'pending' | 'cancelled' = 'paid';

      if (!hasPaid) {
        const cursorAbs = y * 12 + (m - 1);

        if (cursorAbs < absCurrent) {
          status = 'overdue';
        } else {
          const isCurrentMonth = cursorAbs === absCurrent;
          status =
            isCurrentMonth && today.getDate() > member.dueDay
              ? 'overdue'
              : 'pending';
        }
      }

      results.push({
        month: m,
        year: y,
        monthPayments,
        status,
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }

    return results.reverse();
  }, [member, payments]);

  // Fetch all necessary data for the member profile
  useEffect(() => {
    const loadAllData = async () => {
      if (!memberId) return;
      setIsLoading(true);

      try {
        const [memberRes, paymentsRes, plansRes] = await Promise.all([
          api.get(`/members/${memberId}`),
          api.get('/payments/search', { params: { memberId } }),
          api.get(`/plans/`),
        ]);

        setPlans(plansRes.data.plans);
        setMember(memberRes.data.member);
        setPayments(paymentsRes.data.payments);
      } catch (err) {
        handleApiError(err, 'Não foi possível carregar o histórico do aluno.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, [memberId]);

  // Calculate payment fidelity (compliance) for past and current months
  const compliance = useMemo(() => {
    if (historyList.length === 0) return 0;

    const today = new Date();
    const absCurrent = today.getFullYear() * 12 + today.getMonth();

    const pastAndCurrentMonths = historyList.filter((item) => {
      const itemAbs = item.year * 12 + (item.month - 1);
      return itemAbs <= absCurrent;
    });

    if (pastAndCurrentMonths.length === 0) return 100;

    const paidMonths = pastAndCurrentMonths.filter(
      (item) => item.status === 'paid',
    ).length;

    return Math.round((paidMonths / pastAndCurrentMonths.length) * 100);
  }, [historyList]);

  return (
    <div className='h-full flex flex-col'>
      {isLoading ? (
        <div className='space-y-4 p-6'>
          <div className='h-8 w-48 bg-zinc-800 rounded animate-pulse' />
          <div className='h-4 w-32 bg-zinc-800 rounded animate-pulse' />
        </div>
      ) : (
        <div className='flex flex-col h-full  md:pb-6'>
          {/* Header with member info and plan details */}
          <div className='md:py-6 md:mb-6 md:px-6 border-b border-zinc-800/50 shrink-0'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold tracking-tight text-white'>
                  <span className='md:hidden'>
                    {formatNameMobile(member ? member.name : '')}
                  </span>
                  <span className='hidden md:inline-block'>{member?.name}</span>
                </h2>

                <p className='text-sm text-zinc-500'>
                  Histórico financeiro e log
                </p>
              </div>

              <div className='text-right'>
                <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50 mr-5 md:mr-0'>
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${member?.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  />
                  <span className='text-[10px] font-bold uppercase tracking-wider'>
                    <span className='hidden md:inline-block'>
                      {plan?.name} •{' '}
                    </span>{' '}
                    R$ {plan ? formatNumber(plan?.price) : 0}
                  </span>
                </div>
                <p className='mt-2 text-[10px] text-zinc-600 uppercase tracking-widest font-medium'>
                  CPF: {member?.cpf}
                </p>
              </div>
            </div>

            {/* Financial stats summary */}
            <div className='my-6 md:mb-0 grid grid-cols-3 gap-2 md:gap-4 '>
              <div className='flex flex-col justify-center text-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50'>
                <p className='text-[10px] text-zinc-500 uppercase font-bold'>
                  Total Pago
                </p>
                <p className='text-sm font-semibold text-zinc-100'>
                  R$ {formatNumber(totalPaid)}
                </p>
              </div>
              <div className='flex flex-col justify-center text-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50'>
                <p className='text-[10px] text-zinc-500 uppercase font-bold'>
                  Membro Desde
                </p>
                <p className='text-sm font-semibold text-zinc-100'>
                  {formattedDate}
                </p>
              </div>
              <div className='flex flex-col text-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50'>
                <p className='text-[10px] text-zinc-500 uppercase font-bold'>
                  Adesão
                </p>
                <p
                  className={`text-sm font-semibold ${compliance >= 80 ? 'text-emerald-500' : 'text-rose-500'}`}
                >
                  {compliance}%
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable list of monthly payments */}
          <div className='flex-1 overflow-y-auto p-0 pb-0 md:px-6 md:pb-6 custom-scrollbar'>
            <div className='flex flex-col divide-y divide-zinc-800/50'>
              {historyList.map((item) => (
                <div key={`${item.year}-${item.month}`} className='py-4'>
                  {/* Informações do Mês */}
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center gap-4'>
                      <div
                        className={`h-2 w-2 rounded-full ${
                          item.status === 'paid'
                            ? 'bg-emerald-500'
                            : item.status === 'overdue'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                        }`}
                      />
                      <span className='text-sm font-semibold text-zinc-100 capitalize'>
                        {monthsBR[item.month - 1]} {item.year}
                      </span>
                    </div>
                    {/* Monthly status: paid or overdue */}
                    {item.status !== 'paid' && (
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded uppercase ${
                          item.status === 'overdue'
                            ? 'text-rose-500/80 bg-rose-500/10'
                            : 'text-amber-500/80 bg-amber-500/10'
                        }`}
                      >
                        {item.status === 'overdue' ? 'ATRASADO' : 'PENDENTE'}
                      </span>
                    )}
                  </div>

                  {/* Monthly transaction list (paid and cancelled) */}
                  <div className='ml-6 space-y-2'>
                    {item.monthPayments.length > 0 ? (
                      item.monthPayments.map((p) => (
                        <div
                          key={p.id}
                          className='flex items-center justify-between group'
                        >
                          <div className='flex flex-col'>
                            <span
                              className={`text-xs ${p.status === 'cancelled' ? 'text-zinc-600 line-through' : 'text-zinc-400'}`}
                            >
                              {p.status === 'paid'
                                ? `Recebido em ${formatShortDate(p.paymentDate || new Date())} • ${p.paymentMethod?.toUpperCase()}`
                                : p.description || 'Pagamento cancelado'}
                            </span>
                          </div>
                          <div className='flex items-center gap-3'>
                            <span
                              className={`text-xs font-bold ${p.status === 'cancelled' ? 'text-zinc-600 line-through' : 'text-zinc-100'}`}
                            >
                              R$ {formatNumber(p.amountPaid)}
                            </span>
                            {p.status === 'cancelled' && (
                              <span className='text-[9px] font-bold text-zinc-700 border border-zinc-800 px-1 rounded'>
                                ESTORNADO
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className='text-xs text-zinc-500 italic'>
                        {item.status === 'overdue'
                          ? 'Nenhum registro de pagamento'
                          : `Vence em ${member?.dueDay.toString().padStart(2, '0')}/${item.month.toString().padStart(2, '0')}`}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {/* Initial registration record */}
              <div className='flex items-center justify-between py-4 border-b border-dashed border-zinc-800/50'>
                <div className='flex items-center gap-4'>
                  <div className='h-2 w-2 rounded-full bg-zinc-500' />
                  <div className='flex flex-col'>
                    <span className='text-sm font-semibold text-zinc-100'>
                      Matrícula
                    </span>
                    <span className='text-xs text-zinc-500'>
                      Entrou em{' '}
                      {member?.createdAt &&
                        new Date(member.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <span className='text-[10px] font-medium text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded uppercase'>
                  Novo Aluno
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
