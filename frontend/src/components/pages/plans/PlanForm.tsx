import { useState } from 'react';
import type { IPlan } from '@/interfaces/Plan';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PlanFormProps {
  onChange: (data: Partial<IPlan>) => void;
  initialData?: Partial<IPlan>;
}

export function PlanForm({ onChange, initialData }: PlanFormProps) {
  // Form state initialized with plan details or default values
  const [formData, setFormData] = useState<Partial<IPlan>>({
    name: initialData?.name || '',
    price: initialData?.price || 0,
    timesPerWeek: initialData?.timesPerWeek || 1,
  });

  // Handle input changes and notify parent component
  // TODO: handle any type
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: unknown } },
  ) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };

    setFormData(updatedData);
    onChange({ ...updatedData });
  };

  return (
    <div className='grid gap-6 pb-8 md:px-6 md:pb-0'>
      <div className='grid gap-2'>
        <Label htmlFor='name' className='text-zinc-400'>
          Nome do Plano
        </Label>
        <Input
          id='name'
          name='name'
          value={formData.name}
          onChange={(e) =>
            handleChange(e as React.ChangeEvent<HTMLInputElement>)
          }
          placeholder='Ex: Pro'
          className='h-12 md:h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='price' className='text-zinc-400'>
            Preço (R$)
          </Label>
          <Input
            id='price'
            name='price'
            type='number'
            step='0.01'
            value={formData.price}
            onChange={(e) =>
              handleChange(e as React.ChangeEvent<HTMLInputElement>)
            }
            placeholder='0,00'
            className='h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
          />
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='timesPerWeek' className='text-zinc-400'>
            Aulas por Semana
          </Label>
          <Select
            value={formData.timesPerWeek ? String(formData.timesPerWeek) : ''}
            onValueChange={(value) =>
              handleChange({
                target: { name: 'timesPerWeek', value: Number(value) },
              })
            }
          >
            <SelectTrigger className='h-12 md:h-11 border-white/10 bg-white/5 rounded-xl'>
              <SelectValue placeholder='Selecione a frequência' />
            </SelectTrigger>
            <SelectContent className='z-110 bg-zinc-950 border-white/10'>
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <SelectItem
                  key={num}
                  value={String(num)}
                  className='focus:bg-emerald-500/10 focus:text-emerald-400 font-medium'
                >
                  {num}x na semana
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
