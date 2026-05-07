import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import type { IPlan } from '@/interfaces/Plan';

import { PlanForm } from './PlanForm';

import { CalendarDaysIcon, Plus } from 'lucide-react';
import { RegisterModal } from '@/components/shared/RegisterModal';
import { PageHeader } from '../../shared/PageHeader';
import { handleApiError } from '@/utils/handleApiError';
import { toast } from 'sonner';
import { PlansTable } from './PlansTable';

export function Plans() {
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPlanData, setNewPlanData] = useState<Partial<IPlan>>({});
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all plans from the server
  const fetchPlans = async () => {
    try {
      const response = await api.get('/plans');
      setPlans(response.data.plans);
    } catch (err) {
      handleApiError(err, 'Não foi possível carregar os planos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Register a new membership plan
  const handleSave = async () => {
    try {
      await api.post('/plans/register', newPlanData);
      toast.success('Plano registrado com sucesso!');
      await fetchPlans();
      closeAndResetModal();
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  // Update an existing membership plan
  const handleUpdate = async (id: number) => {
    try {
      await api.put(`/plans/${id}`, newPlanData);
      toast.success('Plano atualizado com sucesso!');
      await fetchPlans();
      closeAndResetModal();
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  // Prepare the modal for editing a plan
  const prepareEdit = (plan: IPlan) => {
    setNewPlanData(plan);
    setEditingPlanId(plan.id!);
    setIsModalOpen(true);
  };

  // Close the modal and reset all related states
  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setEditingPlanId(null);
    setNewPlanData({});
  };

  // Toggle the active/inactive status of a plan
  const handleIsActive = async (id: number) => {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;

    const actionEn = plan.isActive ? 'inactivate' : 'reactivate';

    try {
      await api.patch(`/plans/${actionEn}/${id}`);
      toast.success(
        `Plano ${plan.isActive ? 'inativado' : 'reativado'} com sucesso!`,
      );
      await fetchPlans();
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  // Permanently delete a membership plan
  const handleDelete = async (id: number) => {
    const plan = plans.find((p) => p.id === id);
    if (!plan) return;

    try {
      await api.delete(`/plans/${id}`);
      toast.success(`Plano ${plan?.name} removido.`);
      await fetchPlans();
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  if (isLoading)
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-zinc-500 font-medium animate-pulse uppercase tracking-widest text-xs'>
          Carregando planos...
        </p>
      </div>
    );

  return (
    <div className='p-4 md:p-8 space-y-8 animate-in fade-in duration-500'>
      <RegisterModal
        title={editingPlanId ? 'Editar Plano' : 'Novo Plano'}
        description='Registre ou atualize os dados do plano de adesão.'
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeAndResetModal();
          else setIsModalOpen(true);
        }}
        trigger={
          <PageHeader
            title='Planos'
            badge={
              <div className='flex size-10 md:size-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.15)]'>
                <CalendarDaysIcon className='size-6 md:size-7 text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.4)]' />
              </div>
            }
            buttonText='Novo Plano'
            buttonIcon={<Plus className='size-4 text-purple-400' />}
            onButtonClick={() => {
              setEditingPlanId(null);
              setNewPlanData({});
              setIsModalOpen(true);
            }}
          />
        }
        onSubmit={
          editingPlanId ? () => handleUpdate(editingPlanId) : handleSave
        }
      >
        <PlanForm
          key={editingPlanId || 'new-plan'}
          onChange={(data) => setNewPlanData(data)}
          initialData={newPlanData}
        />
      </RegisterModal>

      <div className='rounded-2xl border border-white/5 bg-white/2 backdrop-blur-sm overflow-hidden transition-all hover:border-white/10'>
        <PlansTable
          plans={plans}
          prepareEdit={prepareEdit}
          handleDelete={handleDelete}
          handleIsActive={handleIsActive}
        />
      </div>
    </div>
  );
}
