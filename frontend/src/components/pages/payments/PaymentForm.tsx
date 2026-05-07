import { useState, useEffect } from 'react';
import type { IPayment } from '@/interfaces/Payment';
import type { IMember } from '@/interfaces/Member';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentFormProps {
  onChange: (data: Partial<IPayment>) => void;
  initialData?: Partial<IPayment>;
  members: IMember[];
}

export function PaymentForm({
  onChange,
  initialData,
  members,
}: PaymentFormProps) {
  const [open, setOpen] = useState(false);

  // Form state initialized with provided data or default values
  const [formData, setFormData] = useState<Partial<IPayment>>({
    memberId: initialData?.memberId || 0,
    month: initialData?.month || new Date().getMonth() + 1,
    year: initialData?.year || new Date().getFullYear(),
    amountPaid: initialData?.amountPaid || 0,
    paymentDate: initialData?.paymentDate || new Date(),
    dueDate: initialData?.dueDate || undefined,
    status: initialData?.status || 'paid',
    paymentMethod: initialData?.paymentMethod || 'pix',
    category: initialData?.category || 'membership',
    description: initialData?.description || '',
  });

  // Keep parent component in sync with local form state
  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  // TODO: correct the any type
  // Generic handler for input changes
  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: unknown } },
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className='grid gap-6 pb-8 md:px-6 md:pb-0'>
      {/* Member selection using shadcn combobox */}
      <Field className='w-full'>
        <Label className='text-zinc-400 mb-2 block'>Aluno</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              className='w-full justify-between font-normal h-11 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all rounded-xl'
            >
              {formData.memberId
                ? members.find((m) => m.id === formData.memberId)?.name
                : 'Selecione um aluno...'}
              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className='w-(--radix-popover-trigger-width) p-0 border-white/10 bg-zinc-950'
            align='start'
          >
            <Command className='bg-zinc-950'>
              <CommandInput
                placeholder='Buscar por nome ou CPF...'
                className='h-11'
              />
              <CommandList className='custom-scrollbar'>
                <CommandEmpty>Nenhum aluno encontrado.</CommandEmpty>
                <CommandGroup>
                  {members.map((member) => (
                    <CommandItem
                      key={member.id}
                      value={member.name}
                      onSelect={() => {
                        // Manually trigger change for the member selection
                        handleChange({
                          target: { name: 'memberId', value: member.id },
                        });
                        setOpen(false);
                      }}
                      className='hover:bg-white/5 focus:bg-white/5 cursor-pointer py-3'
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4 text-emerald-500',
                          formData.memberId === member.id
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      <div className='flex flex-col'>
                        <span className='font-medium text-zinc-100'>
                          {member.name}
                        </span>
                        <span className='text-xs text-zinc-500'>
                          {member.cpf}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </Field>

      {/* Reference period selection */}
      <div className='grid grid-cols-2 gap-4 bg-white/2 p-4 rounded-2xl border border-dashed border-white/10'>
        <div className='grid gap-2'>
          <Label className='text-xs font-bold text-zinc-500 uppercase tracking-widest'>
            Mês de Referência
          </Label>
          <Select
            value={String(formData.month)}
            onValueChange={(val) =>
              handleChange({ target: { name: 'month', value: Number(val) } })
            }
          >
            <SelectTrigger className='h-11 border-white/10 bg-white/5 rounded-xl'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='z-110 bg-zinc-950 border-white/10'>
              {Array.from({ length: 12 }).map((_, i) => (
                <SelectItem
                  key={i + 1}
                  value={String(i + 1)}
                  className='focus:bg-emerald-500/10 focus:text-emerald-400 uppercase text-[10px] font-bold'
                >
                  {new Date(0, i)
                    .toLocaleString('pt-BR', { month: 'long' })
                    .toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='grid gap-2'>
          <Label className='text-xs font-bold text-zinc-500 uppercase tracking-widest'>
            Ano de Referência
          </Label>
          <Select
            value={String(formData.year)}
            onValueChange={(val) =>
              handleChange({ target: { name: 'year', value: Number(val) } })
            }
          >
            <SelectTrigger className='h-11 border-white/10 bg-white/5 rounded-xl'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='z-110 bg-zinc-950 border-white/10'>
              {/* TODO: Correct year selections hard coded */}
              {/* Dynamic year range based on current date */}
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <SelectItem
                  key={y}
                  value={String(y)}
                  className='focus:bg-emerald-500/10 focus:text-emerald-400 font-bold'
                >
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Value and payment method info */}
      <div className='grid grid-cols-2 gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='amountPaid' className='text-zinc-400'>
            Valor Pago (R$)
          </Label>
          <Input
            id='amountPaid'
            name='amountPaid'
            type='number'
            step='10.00'
            value={formData.amountPaid}
            onChange={handleChange}
            className='h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
          />
        </div>

        <div className='grid gap-2'>
          <Label className='text-zinc-400'>Forma de Pagamento</Label>
          <Select
            value={formData.paymentMethod}
            onValueChange={(val) =>
              handleChange({ target: { name: 'paymentMethod', value: val } })
            }
          >
            <SelectTrigger className='h-11 border-white/10 bg-white/5 rounded-xl'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='z-110 bg-zinc-950 border-white/10'>
              <SelectItem
                value='pix'
                className='focus:bg-emerald-500/10 focus:text-emerald-400 font-medium'
              >
                PIX
              </SelectItem>
              <SelectItem
                value='cash'
                className='focus:bg-emerald-500/10 focus:text-emerald-400 font-medium'
              >
                Dinheiro
              </SelectItem>
              <SelectItem
                value='credit_card'
                className='focus:bg-emerald-500/10 focus:text-emerald-400 font-medium'
              >
                Cartão de Crédito
              </SelectItem>
              <SelectItem
                value='debit_card'
                className='focus:bg-emerald-500/10 focus:text-emerald-400 font-medium'
              >
                Cartão de Débito
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payment status and category */}
      <div className='grid grid-cols-2 gap-4'>
        <div className='grid gap-2'>
          <Label className='text-zinc-400'>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(val) =>
              handleChange({ target: { name: 'status', value: val } })
            }
          >
            <SelectTrigger className='h-11 border-white/10 bg-white/5 rounded-xl'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='z-110 bg-zinc-950 border-white/10'>
              <SelectItem
                value='paid'
                className='focus:bg-emerald-500/10 focus:text-emerald-400 font-medium text-emerald-500'
              >
                Pago
              </SelectItem>
              <SelectItem
                value='pending'
                className='focus:bg-amber-500/10 focus:text-amber-400 font-medium text-amber-500'
              >
                Pendente
              </SelectItem>
              <SelectItem
                value='overdue'
                className='focus:bg-rose-500/10 focus:text-rose-400 font-medium text-rose-500'
              >
                Atrasado
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='grid gap-2'>
          <Label className='text-zinc-400'>Categoria</Label>
          <Select
            value={formData.category}
            onValueChange={(val) =>
              handleChange({ target: { name: 'category', value: val } })
            }
          >
            <SelectTrigger className='h-11 border-white/10 bg-white/5 rounded-xl'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='z-110 bg-zinc-950 border-white/10'>
              <SelectItem
                value='membership'
                className='focus:bg-emerald-500/10 focus:text-emerald-400 font-medium'
              >
                membership
              </SelectItem>
              <SelectItem
                value='product'
                className='focus:bg-emerald-500/10 focus:text-emerald-400 font-medium'
              >
                product
              </SelectItem>
              <SelectItem
                value='other'
                className='focus:bg-emerald-500/10 focus:text-emerald-400 font-medium'
              >
                other
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Additional notes */}
      <div className='grid gap-2'>
        <Label htmlFor='description' className='text-zinc-400'>
          Descrição
        </Label>
        <Input
          id='description'
          name='description'
          value={formData.description}
          onChange={handleChange}
          placeholder='Observações opcionais...'
          className='h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
        />
      </div>
    </div>
  );
}
