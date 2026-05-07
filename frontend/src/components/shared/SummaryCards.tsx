import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { IDashboardResponse } from '@/interfaces/DashBoard';
import { formatNumber } from '@/utils/formatNumber';
import {
  Users,
  TrendingUp,
  Target,
  WalletMinimal,
  TrendingDown,
  BanknoteArrowDown,
  BanknoteArrowUp,
} from 'lucide-react';

interface SummaryCardsProps {
  statistic: IDashboardResponse | null;
  selectedMonth: number | null;
  selectedYear: number | null;
}

export function SummaryCards({
  statistic,
  selectedMonth,
  selectedYear,
}: SummaryCardsProps) {
  // Logic to calculate the current months compliance rate
  const complianceAmount = Number(statistic?.paymentsCount) || 0;
  const members = Number(statistic?.activeMembers) || 0;
  const complianceRate = members > 0 ? (complianceAmount / members) * 100 : 0;

  // Logic to calculate expenses rate
  const totalExpenses = Number(statistic?.expectedExpense) || 0;
  const expenses = Number(statistic?.expensesPaid) || 0;
  const expensesRate = totalExpenses > 0 ? (expenses / totalExpenses) * 100 : 0;

  // Logic to calculate balance rate
  const totalRevenue = Number(statistic?.revenue);
  // const totalBalance = Number(statistic?.netBalance);
  const balanceRate =
    totalRevenue > 0 ? (totalRevenue / totalExpenses) * 100 : 0;

  // Formatting the month name for display
  const monthName = new Date(
    selectedYear || 2026,
    (selectedMonth || 1) - 1,
    1,
  ).toLocaleString('pt-BR', { month: 'long' });

  return (
    <>
      {/* Revenue card */}
      <Card className='relative flex-col gap-2 bg-linear-to-br from-emerald-600 to-emerald-800 shadow-xl border-none rounded-2xl text-white overflow-hidden group justify-between'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='text-xs font-semibold uppercase tracking-wider text-emerald-200'>
            Faturamento
          </CardTitle>
          <WalletMinimal className='h-4 w-4 text-emerald-300 group-hover:scale-110 transition-transform' />
        </CardHeader>

        <CardContent className='space-y-3'>
          <div className='mb-0 md:mb-3'>
            <div className='flex items-baseline gap-1 text-4xl lg:text-3xl 2xl:text-5xl font-extrabold tracking-tighter text-white'>
              <span className='text-xl md:text-2xl font-medium opacity-70'>
                R$
              </span>
              {formatNumber(statistic?.revenue || 0)}
            </div>
            {/* Target Comparison */}
            <div className='lg:h-6 lg:mt-1 lg:mb-6 2xl:h-auto 2xl:mt-0 2xl:mb-0'>
              <p className='text-sm font-medium text-emerald-100/80 mt-1'>
                de{' '}
                <span className='text-white font-bold'>
                  R$ {formatNumber(statistic?.expectedRevenue || 0)}
                </span>{' '}
                a receber
              </p>
            </div>
          </div>

          {/* Progress section */}
          <div className='space-y-1.5 hidden md:block'>
            <div className='flex justify-between items-end'>
              <span className='text-[10px] font-bold uppercase text-emerald-200'>
                Progresso Mensal
              </span>
              <span className='text-xs font-bold text-white'>
                {complianceRate.toFixed(0)}%
              </span>
            </div>
            <div className='h-2 w-full bg-emerald-900/40 rounded-full overflow-hidden'>
              <div
                className='h-full bg-white rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                style={{ width: `${Math.min(complianceRate, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className='hidden md:flex'>
          {/* Footer badge */}
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1.5 bg-black/10 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full'>
              <span className='text-[10px] font-bold uppercase tracking-tight'>
                {monthName}
              </span>
            </div>
          </div>
        </CardFooter>

        {/* Visual flair - Glow effect */}
        <div className='absolute -top-10 -left-10 h-32 w-32 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none' />
      </Card>

      {/* Monthly expenses card */}
      <Card className='relative flex-col gap-2 bg-linear-to-br from-rose-600 to-rose-800 shadow-xl border-none rounded-2xl text-white overflow-hidden group justify-between'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='text-xs font-semibold uppercase tracking-wider text-rose-200'>
            Despesas
          </CardTitle>
          <Target className='h-4 w-4 text-rose-300 group-hover:scale-110 transition-transform' />
        </CardHeader>

        <CardContent className='space-y-3'>
          <div className='mb-0 md:mb-3'>
            <div className='flex items-baseline gap-1 text-4xl lg:text-3xl 2xl:text-5xl font-extrabold tracking-tighter text-white'>
              <span className='text-xl md:text-2xl font-medium opacity-70'>
                R$
              </span>
              {formatNumber(statistic?.expensesPaid || 0)}
            </div>
            {/* Target Comparison */}
            <div className='lg:h-6 lg:mt-1 lg:mb-6 2xl:h-auto 2xl:mt-0 2xl:mb-0'>
              <p className='text-sm font-medium text-rose-100/80 mt-1'>
                de{' '}
                <span className='text-white font-bold'>
                  R$ {formatNumber(statistic?.expectedExpense || 0)}
                </span>{' '}
                a pagar
              </p>
            </div>
          </div>

          {/* Progress section */}
          <div className='space-y-1.5 hidden md:block'>
            <div className='flex justify-between items-end'>
              <span className='text-[10px] font-bold uppercase text-rose-200'>
                Progresso Mensal
              </span>
              <span className='text-xs font-bold text-white'>
                {expensesRate.toFixed(0)}%
              </span>
            </div>
            <div className='h-2 w-full bg-rose-900/50 rounded-full overflow-hidden'>
              <div
                className='h-full bg-white rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                style={{ width: `${Math.min(expensesRate, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className='hidden md:flex'>
          {/* Footer badge */}
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1.5 bg-black/10 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full'>
              <span className='text-[10px] font-bold uppercase tracking-tight'>
                {monthName}
              </span>
            </div>
          </div>
        </CardFooter>

        {/* Visual flair - Glow effect */}
        <div className='absolute -top-10 -left-10 h-32 w-32 bg-rose-400/20 rounded-full blur-3xl pointer-events-none' />
      </Card>

      {/*Balance card */}
      <Card className='relative flex-col gap-2 bg-linear-to-br from-yellow-400 to-yellow-600 shadow-xl border-none rounded-2xl text-white overflow-hidden group justify-between'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='text-xs font-semibold uppercase tracking-wider text-yellow-100'>
            Balanço
          </CardTitle>
          {(statistic?.netBalance ?? 0) >= 0 ? (
            <TrendingUp className='h-4 w-4 text-yellow-100 group-hover:scale-110 transition-transform' />
          ) : (
            <TrendingDown className='h-4 w-4 text-yellow-100 group-hover:scale-110 transition-transform' />
          )}
        </CardHeader>

        <CardContent className='space-y-3'>
          <div className='mb-0 md:mb-3'>
            <div className='flex items-baseline gap-1 text-4xl lg:text-3xl 2xl:text-5xl font-extrabold tracking-tighter text-white'>
              <span className='text-xl md:text-2xl font-medium opacity-70'>
                R$
              </span>
              {formatNumber(statistic?.netBalance || 0)}
            </div>
            {/* Target Comparison */}
            <div className='lg:h-6 lg:mt-1 lg:mb-6 2xl:h-auto 2xl:mt-0 2xl:mb-0'>
              <p className='text-sm font-medium text-yellow-100/80 mt-1'>
                de{' '}
                <span className='text-white font-bold capitalize'>
                  {(statistic?.netBalance ?? 0) >= 0 ? 'lucro' : 'prejuízo'}
                </span>{' '}
                previsto
              </p>
            </div>
            {/* <span className='text-white/10'>.</span> */}
          </div>

          {/* Progress section */}
          <div className='space-y-1.5 hidden md:block'>
            <div className='flex justify-between items-end'>
              <span className='text-[10px] font-bold uppercase text-yellow-200'>
                Progresso Mensal
              </span>
              <span className='text-white'>
                {balanceRate < 100 ? (
                  <BanknoteArrowDown className='h-4 w-4 text-yellow-100' />
                ) : (
                  <BanknoteArrowUp className='h-4 w-4 text-yellow-100' />
                )}
              </span>
            </div>
            <div className='h-2 w-full bg-yellow-900/20 rounded-full overflow-hidden'>
              <div
                className='h-full bg-white rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                style={{ width: `${Math.min(balanceRate, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className='hidden md:flex'>
          {/* Footer badge */}
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1.5 bg-black/10 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full'>
              <span className='text-[10px] font-bold uppercase tracking-tight'>
                {monthName}
              </span>
            </div>
          </div>
        </CardFooter>

        {/* Visual flair - Glow effect */}
        <div className='absolute -top-10 -left-10 h-32 w-32 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none' />
      </Card>

      {/* Compliance/Fidelity rate card */}
      <Card className='relative flex-col gap-2 bg-linear-to-br from-violet-600 to-violet-800 shadow-xl border-none rounded-2xl text-white overflow-hidden group justify-between'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='text-xs font-semibold uppercase tracking-wider text-violet-200'>
            Adesão
          </CardTitle>
          <Users className='h-4 w-4 text-violet-300 group-hover:scale-110 transition-transform' />
        </CardHeader>

        <CardContent className='space-y-3'>
          <div className='mb-0 md:mb-3'>
            <div className='flex items-baseline gap-1 text-4xl lg:text-3xl 2xl:text-5xl font-extrabold tracking-tighter text-white'>
              <span className='text-xl md:text-2xl font-medium opacity-70'></span>
              {complianceRate.toFixed(0)}%
            </div>
            {/* Target Comparison */}
            <div className='lg:h-6 lg:mt-1 lg:mb-6 2xl:h-auto 2xl:mt-0 2xl:mb-0'>
              <p className='text-sm font-medium text-violet-100/80 mt-1'>
                {' '}
                <span className='text-white font-bold'>
                  {complianceRate < 100
                    ? `${statistic?.paymentsCount} de ${statistic?.activeMembers}`
                    : 'Todos os'}
                </span>{' '}
                alunos pagaram este mês
              </p>
            </div>
          </div>

          {/* Progress section */}
          <div className='space-y-1.5 hidden md:block'>
            <div className='flex justify-between items-end'>
              <span className='text-[10px] font-bold uppercase text-violet-200'>
                Progresso Mensal
              </span>
              <span className='text-xs font-bold text-white'>
                {complianceRate.toFixed(0)}%
              </span>
            </div>
            <div className='h-2 w-full bg-violet-900/40 rounded-full overflow-hidden'>
              <div
                className='h-full bg-white rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                style={{ width: `${Math.min(complianceRate, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className='hidden md:flex'>
          {/* Footer badge */}
          <div className='flex items-center gap-2'>
            <div className='flex items-center gap-1.5 bg-black/10 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full'>
              <span className='text-[10px] font-bold uppercase tracking-tight'>
                {monthName}
              </span>
            </div>
          </div>
        </CardFooter>

        {/* Visual flair - Glow effect */}
        <div className='absolute -top-10 -left-10 h-32 w-32 bg-violet-400/20 rounded-full blur-3xl pointer-events-none' />
      </Card>
    </>
  );
}
