import type { IExpense } from '@/interfaces/Expense';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { ExpenseForm } from './ExpenseForm';
import { RegisterModal } from '@/components/shared/RegisterModal';
import { PageHeader } from '@/components/shared/PageHeader';
import { Plus, Receipt } from 'lucide-react';
import { PeriodSelect } from '../../shared/PeriodSelect';
import { api } from '@/services/api';
import { handleApiError } from '@/utils/handleApiError';
import { ExpensesTable } from './ExpensesTable';
import { toast } from 'sonner';
import { SummaryCards } from '../../shared/SummaryCards';
import type { IDashboardResponse } from '@/interfaces/DashBoard';
import { SearchBar } from '@/components/shared/SearchBar';

export function Expenses() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Core data states
  const [expenses, setExpenses] = useState<IExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statistic, setStatistic] = useState<IDashboardResponse | null>(null);

  // Filter and UI states
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Modal and Editing states
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  const [newExpenseData, setNewExpenseData] = useState<Partial<IExpense>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- STABILIZATION ---
  const handleFormChange = useCallback((data: Partial<IExpense>) => {
    setNewExpenseData(data);
  }, []);

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/expenses/search', {
        params: { month: selectedMonth, year: selectedYear },
      });
      setExpenses(response.data.expenses || []);
    } catch (err) {
      handleApiError(err, 'Erro ao carregar despesas.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await api.get('/stats/', {
        params: { month: selectedMonth, year: selectedYear },
      });
      setStatistic(response.data);
    } catch (err) {
      handleApiError(err, 'Erro ao carregar estatísticas.');
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchExpenses();
    fetchStatistics();
  }, [fetchExpenses, fetchStatistics]);

  const filteredList = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return expenses;

    return expenses.filter(
      (e) =>
        e.description.toLowerCase().includes(term) ||
        e.category.toLowerCase().includes(term),
    );
  }, [expenses, searchTerm]);

  const markAsPaid = async (expenseId: number) => {
    setProcessingId(expenseId);
    try {
      await api.patch(`/expenses/pay/${expenseId}`, {
        paymentDate: new Date(),
      });
      await fetchExpenses();
      toast.success('Despesa marcada como paga!');
    } catch (error) {
      handleApiError(error);
    } finally {
      setProcessingId(null);
    }
  };

  const prepareEdit = (expense: IExpense) => {
    setNewExpenseData(expense);
    setEditingExpenseId(expense.id!);
    setIsModalOpen(true);
  };

  const handleDelete = async (expenseId: number) => {
    try {
      await api.delete(`/expenses/${expenseId}`);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      toast.success('Despesa excluída com sucesso.');
    } catch (error) {
      handleApiError(error);
    }
  };

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setEditingExpenseId(null);
    setNewExpenseData({});
  };

  const handleSave = async () => {
    try {
      if (editingExpenseId) {
        await api.put(`/expenses/${editingExpenseId}`, newExpenseData);
        toast.success('Despesa atualizada com sucesso!');
      } else {
        await api.post('/expenses/register', newExpenseData);
        toast.success('Lançamento realizado com sucesso!');
      }

      await fetchExpenses();
      closeAndResetModal();
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-zinc-500 font-medium animate-pulse uppercase tracking-widest text-xs'>
          Carregando pagamentos...
        </p>
      </div>
    );
  }

  return (
    <div className='p-4 md:p-8 space-y-8 animate-in fade-in duration-500'>
      <RegisterModal
        title={editingExpenseId ? 'Editar Despesa' : 'Nova Despesa'}
        description='Registre gastos manuais, fixos ou parcelados.'
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeAndResetModal();
          else setIsModalOpen(true);
        }}
        trigger={
          <PageHeader
            title='Despesas'
            badge={
              <div className='flex size-10 md:size-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]'>
                <Receipt className='size-6 md:size-7 text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.4)]' />
              </div>
            }
            buttonText='Nova Despesa'
            buttonIcon={<Plus className='size-4 text-rose-400' />}
            onButtonClick={() => {
              setEditingExpenseId(null);
              setNewExpenseData({});
              setIsModalOpen(true);
            }}
          />
        }
        onSubmit={handleSave}
      >
        <ExpenseForm
          key={editingExpenseId || 'new-expense'}
          initialData={newExpenseData}
          onChange={handleFormChange}
        />
      </RegisterModal>
      {/* PeriodSelect */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <div className='col-span-1 md:col-span-2 lg:col-span-1'>
          <PeriodSelect
            initialData={{ selectedMonth, selectedYear }}
            onPeriodChange={(m, y) => {
              setSelectedMonth(m);
              setSelectedYear(y);
            }}
          />
        </div>

        {/* Search bar */}
        <div className='md:col-span-2 lg:col-span-3'>
          <SearchBar
            searchTerm={searchTerm}
            placeHolder='Buscar por descrição...'
            onSearchChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <SummaryCards
          statistic={statistic}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </div>

      {/* Tabel */}
      <div className='rounded-2xl border border-white/5 bg-white/2 backdrop-blur-sm overflow-hidden transition-all hover:border-white/10 mb-2 md:mb-0'>
        <ExpensesTable
          displayList={filteredList}
          onMarkAsPaid={markAsPaid}
          processingId={processingId}
          prepareEdit={prepareEdit}
          handleDelete={handleDelete}
        />
      </div>
    </div>
  );
}
