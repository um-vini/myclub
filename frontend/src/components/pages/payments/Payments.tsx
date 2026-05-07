import { PageHeader } from '@/components/shared/PageHeader';
import type { DisplayMember, IMember } from '@/interfaces/Member';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { api } from '@/services/api';
import type { IPayment, PaymentStatus } from '@/interfaces/Payment';
import { PaymentsTable } from './PaymentsTable';
import { PeriodSelect } from '../../shared/PeriodSelect';
import { CalendarCheck, Plus } from 'lucide-react';
import { RegisterModal } from '@/components/shared/RegisterModal';
import { PaymentForm } from './PaymentForm';
import { SummaryCards } from '../../shared/SummaryCards';
import type { IDashboardResponse } from '@/interfaces/DashBoard';
import { handleApiError } from '@/utils/handleApiError';
import { toast } from 'sonner';
import { SearchBar } from '@/components/shared/SearchBar';

export function Payments() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Core data states
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [members, setMembers] = useState<IMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statistic, setStatistic] = useState<IDashboardResponse | null>(null);

  // Filter and UI states
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Modal and Editing states
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);
  const [newPaymentData, setNewPaymentData] = useState<Partial<IPayment>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all members
  const fetchMembers = async () => {
    try {
      const response = await api.get('/members');
      setMembers(response.data.members);
    } catch (err) {
      handleApiError(err, 'Não foi possível carregar os alunos.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch financial statistics for the selected period
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

  // Fetch payments for the selected period
  const fetchPayments = useCallback(async () => {
    try {
      const response = await api.get('/payments/search', {
        params: {
          month: selectedMonth,
          year: selectedYear,
        },
      });

      setPayments(response.data.payments);
    } catch (err) {
      handleApiError(err, 'Erro ao carregar pagamentos.');
    }
  }, [selectedMonth, selectedYear]);

  // Initial load
  useEffect(() => {
    fetchMembers();
  }, []);

  // Sync payments and statistics when period changes
  useEffect(() => {
    fetchPayments();
    fetchStatistics();
  }, [fetchPayments, fetchStatistics]);

  // Process display list with logic for status (paid, overdue, pending)
  const displayList = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonthReal = now.getMonth() + 1;
    const currentYearReal = now.getFullYear();

    const registeredMembers = members.filter((m) => {
      const signupDate = new Date(m.createdAt);
      const absSignup =
        signupDate.getFullYear() * 12 + (signupDate.getMonth() + 1);
      const absSelected = selectedYear * 12 + selectedMonth;
      return absSelected >= absSignup;
    });

    const list = registeredMembers.map((m): DisplayMember => {
      const payment = payments.find(
        (p) => p.memberId === m.id && p.status === 'paid',
      );
      let paymentStatus: PaymentStatus = 'paid';

      if (!payment || payment.status === 'cancelled') {
        if (
          selectedYear < currentYearReal ||
          (selectedYear === currentYearReal && selectedMonth < currentMonthReal)
        ) {
          paymentStatus = 'overdue';
        } else if (
          selectedYear === currentYearReal &&
          selectedMonth === currentMonthReal
        ) {
          paymentStatus = currentDay > m.dueDay ? 'overdue' : 'pending';
        } else {
          paymentStatus = 'pending';
        }
      }

      return {
        ...m,
        payment: payment || null,
        isPaid: !!payment,
        paymentStatus,
      };
    });

    return [...list].sort((a, b) => {
      const weights: Record<string, number> = {
        overdue: 0,
        pending: 1,
        paid: 2,
      };
      if (a.paymentStatus !== b.paymentStatus)
        return weights[a.paymentStatus] - weights[b.paymentStatus];
      return a.name.localeCompare(b.name);
    });
  }, [members, payments, selectedMonth, selectedYear]);

  // Search logic with string normalization
  const filteredList = useMemo(() => {
    const normalize = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    const term = normalize(searchTerm);

    return displayList.filter((m) => {
      const name = normalize(m.name);
      const cpf = m.cpf.replace(/\D/g, '');
      return name.includes(term) || cpf.includes(term);
    });
  }, [displayList, searchTerm]);

  // Quick mark as paid from the main table
  const markAsPaid = async (memberId: number) => {
    const dataMember = members.find((m) => m.id === memberId);
    if (!dataMember) return;

    const paymentData: Partial<IPayment> = {
      memberId: dataMember.id,
      month: selectedMonth,
      year: selectedYear,
      amountPaid: dataMember.plan?.price || 0,
      paymentDate: new Date(),
      dueDate: new Date(selectedYear, selectedMonth - 1, dataMember.dueDay),
      status: 'paid',
      paymentMethod: 'pix',
      category: 'membership',
      description: `Pagamento mensalidade - ${selectedMonth}/${selectedYear}`,
    };

    setProcessingId(memberId);
    try {
      await api.post('/payments/register', paymentData);
      await Promise.all([fetchPayments(), fetchStatistics()]);
      toast.success(`Pagamento de ${dataMember.name} registrado!`);
    } catch (error: unknown) {
      handleApiError(error);
    } finally {
      setProcessingId(null);
    }
  };

  // Open modal for quick payment registration
  const handleQuickPayment = (memberId: number) => {
    const dataMember = members.find((m) => m.id === memberId);
    if (!dataMember) return;

    const paymentData: Partial<IPayment> = {
      memberId: dataMember.id,
      month: selectedMonth,
      year: selectedYear,
      amountPaid: dataMember.plan?.price || 0,
      paymentDate: new Date(),
      dueDate: new Date(selectedYear, selectedMonth - 1, dataMember.dueDay),
      status: 'paid',
      paymentMethod: 'pix',
      category: 'membership',
      description: `Pagamento mensalidade - ${selectedMonth}/${selectedYear}`,
    };

    setNewPaymentData(paymentData);
    setIsModalOpen(true);
  };

  // Set data for editing an existing payment
  const prepareEdit = (payment: IPayment) => {
    setNewPaymentData(payment);
    setEditingPaymentId(payment.id!);
    setIsModalOpen(true);
  };

  // Close modal and clear state
  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setEditingPaymentId(null);
    setNewPaymentData({});
  };

  // Remove a payment record
  // const handleDelete = async (paymentId: number) => {
  //   const payment = payments.find((p) => p.id === paymentId);
  //   if (
  //     !confirm(
  //       `Deseja excluir o pagamento de ${payment?.member?.name} no valor de R$${payment?.amountPaid}?`,
  //     )
  //   )
  //     return;

  //   try {
  //     await api.delete(`/payments/${paymentId}`);
  //     setPayments((prev) => prev.filter((p) => p.id !== paymentId));
  //     fetchStatistics();
  //     toast.success('Pagamento excluído com sucesso.');
  //   } catch (error: unknown) {
  //     handleApiError(error);
  //   }
  // };

  // Cancel a payment record
  const handleCancel = async (paymentId: number) => {
    try {
      await api.patch(`/payments/cancel/${paymentId}`);
      setPayments((prev) => prev.filter((p) => p.id !== paymentId));
      fetchStatistics();
      toast.success('Pagamento estornado com sucesso.');
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  // Main save handler for creation and updates
  const handleSave = async () => {
    try {
      if (editingPaymentId) {
        await api.put(`/payments/${editingPaymentId}`, newPaymentData);
        toast.success('Pagamento atualizado com sucesso!');
      } else {
        await api.post('/payments/register', newPaymentData);
        toast.success('Pagamento registrado com sucesso!');
      }

      await Promise.all([fetchPayments(), fetchStatistics()]);
      closeAndResetModal();
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-zinc-500 font-medium animate-pulse uppercase tracking-widest text-xs'>
          Carregando mensalidades...
        </p>
      </div>
    );
  }

  return (
    <div className='p-4 md:p-8 space-y-8 animate-in fade-in duration-500'>
      <RegisterModal
        title={editingPaymentId ? 'Editar Pagamento' : 'Novo Pagamento'}
        description='Registre ou atualize os dados de pagamento.'
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeAndResetModal();
          else setIsModalOpen(true);
        }}
        trigger={
          <PageHeader
            title='Mensalidades'
            badge={
              <div className='flex size-10 md:size-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]'>
                <CalendarCheck className='size-6 md:size-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]' />
              </div>
            }
            buttonText='Novo Pagamento'
            buttonIcon={<Plus className='size-4 text-emerald-400' />}
            onButtonClick={() => {
              setEditingPaymentId(null);
              setNewPaymentData({});
              setIsModalOpen(true);
            }}
          />
        }
        onSubmit={handleSave}
      >
        <PaymentForm
          key={editingPaymentId || 'new-payment'}
          members={members}
          onChange={(data) => setNewPaymentData(data)}
          initialData={newPaymentData}
        />
      </RegisterModal>

      {/* Period and Search filters */}
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
            placeHolder='Buscar por nome ou CPF...'
            onSearchChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Financial statistics cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <SummaryCards
          statistic={statistic}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </div>

      {/* Main payments list */}
      <div className='rounded-2xl border border-white/5 bg-white/2 backdrop-blur-sm overflow-hidden transition-all hover:border-white/10 mb-2 md:mb-0'>
        <PaymentsTable
          displayList={filteredList}
          onMarkAsPaid={markAsPaid}
          processingId={processingId}
          prepareEdit={prepareEdit}
          handleCancel={handleCancel}
          handleNew={handleQuickPayment}
          selectedMonth={selectedMonth}
        />
      </div>
    </div>
  );
}
