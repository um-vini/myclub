import { useState } from 'react';
import type { IUser, RegisterBody } from '@/interfaces/User';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserFormProps {
  onChange: (data: Partial<RegisterBody>) => void;
  initialData?: Partial<IUser>;
  isEdit?: boolean;
}

export function UserForm({
  onChange,
  initialData,
  isEdit = false,
}: UserFormProps) {
  // Local state for the user form fields
  const [formData, setFormData] = useState<Partial<RegisterBody>>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: '',
    confirmPassword: '',
  });

  // Handle input changes and notify the parent component
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    onChange(updatedData);
  };

  return (
    <div className='grid gap-6 px-6'>
      <div className='grid gap-2'>
        <Label htmlFor='name' className='text-zinc-400'>
          Nome
        </Label>
        <Input
          id='name'
          name='name'
          type='text'
          value={formData.name ?? ''}
          onChange={handleChange}
          placeholder='Nome completo'
          required
          className='h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
        />
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='email' className='text-zinc-400'>
          E-mail
        </Label>
        <Input
          id='email'
          name='email'
          type='email'
          value={formData.email ?? ''}
          onChange={handleChange}
          placeholder='email@exemplo.com'
          required
          className='h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
        />
      </div>

      <div className='relative py-2'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t border-white/10 border-dashed' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-zinc-950 px-2 text-zinc-500 font-bold tracking-widest'>
            Segurança
          </span>
        </div>
      </div>

      <p className='text-[10px] text-zinc-500 uppercase font-bold tracking-tight text-center italic'>
        {isEdit
          ? 'Deixe em branco para manter a senha atual'
          : 'Defina a senha do usuário'}
      </p>

      <div className='grid grid-cols-2 gap-4'>
        <div className='grid gap-2'>
          <Label
            htmlFor='password'
            dangerouslySetInnerHTML={{ __html: 'Senha' }}
            className='text-zinc-400'
          />
          <Input
            id='password'
            name='password'
            type='password'
            value={formData.password ?? ''}
            onChange={handleChange}
            placeholder={isEdit ? '••••••••' : 'Nova senha'}
            className='h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='confirmPassword' className='text-zinc-400'>
            Confirmar
          </Label>
          <Input
            id='confirmPassword'
            name='confirmPassword'
            type='password'
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder='Repita a senha'
            className='h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
          />
        </div>
      </div>
    </div>
  );
}
