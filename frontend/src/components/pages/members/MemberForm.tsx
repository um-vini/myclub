import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { IPlan } from '@/interfaces/Plan';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { IMember } from '@/interfaces/Member';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { handleApiError } from '@/utils/handleApiError';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = [
  { id: 'Monday', name: 'Segunda' },
  { id: 'Tuesday', name: 'Terça' },
  { id: 'Wednesday', name: 'Quarta' },
  { id: 'Thursday', name: 'Quinta' },
  { id: 'Friday', name: 'Sexta' },
  { id: 'Saturday', name: 'Sábado' },
  { id: 'Sunday', name: 'Domingo' },
];

interface MemberFormProps {
  onChange: (data: Partial<IMember>) => void;
  initialData?: Partial<IMember>;
}

export function MemberForm({ onChange, initialData }: MemberFormProps) {
  const [plans, setPlans] = useState<IPlan[]>([]);

  // Form state initialized with provided data or default values
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    cpf: initialData?.cpf || '',
    phone: initialData?.phone || '',
    planId: initialData?.planId ? String(initialData.planId) : '',
    birthDate: initialData?.birthDate
      ? initialData.birthDate.split('T')[0]
      : '',
    trainingTime: initialData?.trainingTime || '',
  });

  // Handle initialization and parsing of training days
  const [selectedDays, setSelectedDays] = useState<string[]>(() => {
    const days = initialData?.trainingDays;

    if (!days) return [];

    if (typeof days === 'string') {
      try {
        return JSON.parse(days);
      } catch {
        return [];
      }
    }

    return Array.isArray(days) ? days : [];
  });

  // Fetch available plans for the selection dropdown
  useEffect(() => {
    api
      .get('/plans')
      .then((res) => setPlans(res.data.plans))
      .catch((err) =>
        handleApiError(err, 'Não foi possível carregar os planos.'),
      );
  }, []);

  // Format data types and notify the parent component of changes
  const formatAndNotify = (data: typeof formData, days: string[]) => {
    onChange({
      ...data,
      planId: data.planId ? Number(data.planId) : undefined,
      trainingDays: days,
    });
  };

  // Toggle selection of training days
  const handleDayChange = (day: string) => {
    const updatedDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];

    setSelectedDays(updatedDays);
    formatAndNotify(formData, updatedDays);
  };

  // Handle input changes for standard form fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };

    setFormData(updatedData);
    formatAndNotify(updatedData, selectedDays);
  };

  return (
    <div className='grid gap-6 pb-8 md:px-6 md:pb-0'>
      {' '}
      {/* Name */}
      <div className='grid gap-2'>
        <Label htmlFor='name' className='text-zinc-400'>
          Nome Completo
        </Label>
        <Input
          id='name'
          name='name'
          value={formData.name}
          onChange={handleChange}
          placeholder='Ex: João Silva'
          className='h-12 md:h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
        />
      </div>
      {/* Email and phone - Stack on mobile, grid on desktop */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='email' className='text-zinc-400'>
            E-mail
          </Label>
          <Input
            id='email'
            name='email'
            type='email'
            value={formData.email}
            onChange={handleChange}
            placeholder='joao@exemplo.com'
            className='h-12 md:h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='phone' className='text-zinc-400'>
            Telefone
          </Label>
          <Input
            id='phone'
            name='phone'
            value={formData.phone}
            onChange={handleChange}
            placeholder='(99) 99999-0000'
            className='h-12 md:h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
          />
        </div>
      </div>
      {/* CPF and birthdate - Stack on mobile, grid on desktop */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='cpf' className='text-zinc-400'>
            CPF
          </Label>
          <Input
            id='cpf'
            name='cpf'
            value={formData.cpf}
            onChange={handleChange}
            placeholder='000.000.000-00'
            className='h-12 md:h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
          />
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='birthDate' className='text-zinc-400'>
            Data de Nascimento
          </Label>
          <Input
            id='birthDate'
            name='birthDate'
            value={formData.birthDate}
            type='date'
            onChange={handleChange}
            className='h-12 md:h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
          />
        </div>
      </div>
      {/* Plan and training time - Stack on mobile, grid on desktop */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='planId' className='text-zinc-400'>
            Plano
          </Label>
          <Select
            value={formData.planId}
            onValueChange={(value) =>
              handleChange({
                target: { name: 'planId', value },
              } as React.ChangeEvent<HTMLInputElement>)
            }
          >
            <SelectTrigger className='h-12 md:h-11 border-white/10 bg-white/5 rounded-xl'>
              <SelectValue placeholder='Selecione um plano' className='' />
            </SelectTrigger>
            <SelectContent className='z-110 bg-zinc-950 border-white/10'>
              {plans.map((plan) => (
                <SelectItem
                  key={plan.id}
                  value={String(plan.id)}
                  className='focus:bg-emerald-500/10 focus:text-emerald-400 font-medium h-12 md:h-10'
                >
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='trainingTime' className='text-zinc-400'>
            Horário de Treino
          </Label>
          <Input
            id='trainingTime'
            name='trainingTime'
            type='time'
            step='60'
            value={formData.trainingTime}
            onChange={handleChange}
            required
            className='h-12 md:h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
          />
        </div>
      </div>
      {/* Trainig days*/}
      <div className='grid gap-3'>
        <Label className='text-xs font-bold text-zinc-500 uppercase tracking-widest'>
          Dias de Treino
        </Label>
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDays.includes(day.id);

            return (
              <label
                key={day.id}
                className={cn(
                  'flex items-center justify-center h-12 border rounded-xl cursor-pointer transition-all duration-300',
                  isSelected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'bg-white/5 text-zinc-500 border-white/10 hover:bg-white/10 hover:border-white/20',
                )}
              >
                <input
                  type='checkbox'
                  className='hidden'
                  checked={isSelected}
                  onChange={() => handleDayChange(day.id)}
                />
                <span className='text-[10px] font-black uppercase tracking-tight'>
                  {day.name}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
