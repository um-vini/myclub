import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import type { IUser } from '@/interfaces/User';

import { UserForm } from './UserForm';

import { Plus, UsersRound } from 'lucide-react';
import { RegisterModal } from '@/components/shared/RegisterModal';

import { handleApiError } from '@/utils/handleApiError';
import { toast } from 'sonner';
import { UsersTable } from './UsersTable';
import { PageHeader } from '@/components/shared/PageHeader';

export function Users() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUserData, setNewUserData] = useState<Partial<IUser>>({});
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      console.log(response.data.users);
      setUsers(response.data.users);
    } catch (err) {
      handleApiError(err, 'Não foi possível carregar a lista de usuários.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Register a new user
  const handleSave = async () => {
    try {
      await api.post('/users/register', newUserData);
      toast.success('Usuário registrado com sucesso!');
      await fetchUsers();
      closeAndResetModal();
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  // Update existing user
  const handleUpdate = async (id: number) => {
    try {
      await api.put(`/users/${id}`, newUserData);
      toast.success('Usuário atualizado com sucesso!');
      await fetchUsers();
      closeAndResetModal();
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  // Prepare form data for editing
  const prepareEdit = (user: IUser) => {
    setNewUserData({
      name: user.name,
      email: user.email,
    });
    setEditingUserId(user.id!);
    setIsModalOpen(true);
  };

  // Reset modal state and clear temporary data
  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
    setNewUserData({});
  };

  // Delete
  const handleDelete = async (id: number) => {
    const user = users.find((p) => p.id === id);
    if (!user) return;

    try {
      await api.delete(`/users/${id}`);
      toast.success(`Usuário ${user?.name} removido.`);
      await fetchUsers();
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  if (isLoading)
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-zinc-500 font-medium animate-pulse uppercase tracking-widest text-xs'>
          Carregando usuários...
        </p>
      </div>
    );

  return (
    <div className='p-4 md:p-8 space-y-8 animate-in fade-in duration-500'>
      <RegisterModal
        title={editingUserId ? 'Editar Usuário' : 'Novo Usuário'}
        description='Registre ou atualize os dados de acesso do usuário.'
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeAndResetModal();
          else setIsModalOpen(true);
        }}
        trigger={
          <PageHeader
            title='Usuários'
            badge={
              <div className='flex size-10 md:size-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]'>
                <UsersRound className='size-6 md:size-7 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' />
              </div>
            }
            buttonText='Novo Usuário'
            buttonIcon={<Plus className='size-4 text-amber-400' />}
            onButtonClick={() => {
              setNewUserData({});
              setEditingUserId(null);
              setIsModalOpen(true);
            }}
          />
        }
        onSubmit={
          editingUserId ? () => handleUpdate(editingUserId) : handleSave
        }
      >
        <UserForm
          key={editingUserId || 'new-user'}
          onChange={(data) => setNewUserData(data)}
          initialData={newUserData}
          isEdit={!!editingUserId}
        />
      </RegisterModal>

      <div className='rounded-2xl border border-white/5 bg-white/2 backdrop-blur-sm overflow-hidden transition-all hover:border-white/10'>
        <UsersTable
          users={users}
          prepareEdit={prepareEdit}
          handleDelete={handleDelete}
        />
      </div>
    </div>
  );
}
