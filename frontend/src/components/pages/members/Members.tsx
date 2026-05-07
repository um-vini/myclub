import { useEffect, useMemo, useState } from 'react';
import { api } from '../../../services/api';
import type { IMember } from '../../../interfaces/Member';
import { MemberForm } from './MemberForm';

import { Plus, UsersIcon } from 'lucide-react';
import { RegisterModal } from '@/components/shared/RegisterModal';
import { PageHeader } from '../../shared/PageHeader';
import { handleApiError } from '@/utils/handleApiError';
import { toast } from 'sonner';
import { SearchBar } from '@/components/shared/SearchBar';
import { MembersTable } from './MembersTable';

export function Members() {
  const [members, setMembers] = useState<IMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMemberData, setNewMemberData] = useState<Partial<IMember>>({});
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all members from the database
  const fetchMembers = async () => {
    try {
      const response = await api.get('/members');
      setMembers(response.data.members);
    } catch (err) {
      handleApiError(err, 'Não foi possível carregar a lista de alunos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Search logic with string normalization
  const filteredList = useMemo(() => {
    const normalize = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    const term = normalize(searchTerm);

    return members.filter((m) => {
      const name = normalize(m.name);
      const cpf = m.cpf.replace(/\D/g, '');
      return name.includes(term) || cpf.includes(term);
    });
  }, [members, searchTerm]);

  // Save a new member record
  const handleSave = async () => {
    try {
      await api.post('/members/register', newMemberData);
      toast.success('Aluno registrado com sucesso!');
      await fetchMembers();
      closeAndResetModal();
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  // Update an existing member record
  const handleUpdate = async (id: number) => {
    try {
      await api.put(`/members/${id}`, newMemberData);
      toast.success('Dados do aluno atualizados!');
      await fetchMembers();
      closeAndResetModal();
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  // Prepare form data for editing
  const prepareEdit = (member: IMember) => {
    setNewMemberData(member);
    setEditingMemberId(member.id!);
    setIsModalOpen(true);
  };

  // Reset modal state and clear data
  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setEditingMemberId(null);
    setNewMemberData({});
  };

  // Toggle member active/inactive status
  const handleIsActive = async (id: number) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;

    const actionEn = member.isActive ? 'inactivate' : 'reactivate';

    try {
      await api.patch(`/members/${actionEn}/${id}`);
      toast.success(
        `Aluno ${member.isActive ? 'inativado' : 'reativado'} com sucesso!`,
      );
      await fetchMembers();
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  // Permanently delete a member record
  const handleDelete = async (id: number) => {
    const member = members.find((m) => m.id === id);
    if (!member) return;

    try {
      await api.delete(`/members/${id}`);
      toast.success(`${member?.name} foi removido do sistema.`);
      await fetchMembers();
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  if (isLoading)
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-zinc-500 font-medium animate-pulse uppercase tracking-widest text-xs'>
          Carregando alunos...
        </p>
      </div>
    );

  return (
    <div className='p-4 md:p-8 space-y-8 animate-in fade-in duration-500'>
      <RegisterModal
        title={editingMemberId ? 'Editar Aluno' : 'Novo Aluno'}
        description='Registre ou atualize os dados do aluno.'
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeAndResetModal();
          else setIsModalOpen(true);
        }}
        trigger={
          <PageHeader
            title='Alunos'
            badge={
              <div className='flex size-10 md:size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]'>
                <UsersIcon className='size-6 md:size-7 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.4)]' />
              </div>
            }
            buttonText='Novo Aluno'
            buttonIcon={<Plus className='size-4 text-blue-400' />}
            onButtonClick={() => {
              setEditingMemberId(null);
              setNewMemberData({});
              setIsModalOpen(true);
            }}
          />
        }
        onSubmit={
          editingMemberId ? () => handleUpdate(editingMemberId) : handleSave
        }
      >
        <MemberForm
          key={editingMemberId || 'new-member'}
          onChange={(data) => setNewMemberData(data)}
          initialData={newMemberData}
        />
      </RegisterModal>

      {/* Search bar */}
      <div className='mb-6'>
        <SearchBar
          searchTerm={searchTerm}
          placeHolder='Buscar por nome ou CPF...'
          onSearchChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* table */}
      <div className='rounded-2xl border border-white/5 bg-white/2 backdrop-blur-sm overflow-hidden transition-all hover:border-white/10'>
        <MembersTable
          members={members}
          filteredList={filteredList}
          prepareEdit={prepareEdit}
          handleDelete={handleDelete}
          handleIsActive={handleIsActive}
        />
      </div>
    </div>
  );
}
