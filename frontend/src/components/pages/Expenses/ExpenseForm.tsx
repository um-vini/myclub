import { useState, useEffect } from 'react';
import type { IExpense } from '@/interfaces/Expense';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface ExpenseFormProps {
  onChange: (data: Partial<IExpense>) => void;
  initialData?: Partial<IExpense>;
}

export function ExpenseForm({ onChange, initialData }: ExpenseFormProps) {
  const today = new Date();

  // Local state to manage UI toggle
  const [paymentType, setPaymentType] = useState<'paid' | 'pending'>(
    initialData?.status === 'paid' ? 'paid' : 'pending',
  );

  const [formData, setFormData] = useState<Partial<IExpense>>({
    description: initialData?.description || '',
    amount: initialData?.amount || 0,
    // Default to today's date for both fields
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : today,
    paymentDate: initialData?.paymentDate
      ? new Date(initialData.paymentDate)
      : today,
    status: initialData?.status || 'pending',
    category: initialData?.category || 'other',
    isRecurring: initialData?.isRecurring || false,
    totalInstallments: initialData?.totalInstallments || 1,
    observations: initialData?.observations || '',
  });

  // Sync with parent component
  useEffect(() => {
    // If "Paid" (À vista), ensures that paymentDate is set to today if it was null
    const updatedData = {
      ...formData,
      status: paymentType,
      paymentDate: paymentType === 'paid' ? formData.paymentDate : null,
      dueDate: paymentType === 'paid' ? formData.dueDate : formData.dueDate,
    };
    onChange(updatedData);
  }, [formData, paymentType, onChange]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string | number | boolean } },
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className='grid gap-6 pb-8 md:px-6 md:pb-0'>
      {/* Primary Fields */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='description' className='text-zinc-400'>
            Descrição
          </Label>
          <Input
            id='description'
            name='description'
            value={formData.description}
            onChange={handleChange}
            placeholder='Ex: Conta de luz, Aluguel...'
            className='h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
          />
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
              <SelectValue placeholder='Select...' />
            </SelectTrigger>
            <SelectContent className='z-110 bg-zinc-950 border-white/10'>
              <SelectItem
                value='utilities'
                className='focus:bg-emerald-500/10 focus:text-emerald-400'
              >
                Utilidades
              </SelectItem>
              <SelectItem
                value='rent'
                className='focus:bg-emerald-500/10 focus:text-emerald-400'
              >
                Aluguel
              </SelectItem>
              <SelectItem
                value='equipment'
                className='focus:bg-emerald-500/10 focus:text-emerald-400'
              >
                Equipamentos
              </SelectItem>
              <SelectItem
                value='salary'
                className='focus:bg-emerald-500/10 focus:text-emerald-400'
              >
                Salários
              </SelectItem>
              <SelectItem
                value='marketing'
                className='focus:bg-emerald-500/10 focus:text-emerald-400'
              >
                Marketing
              </SelectItem>
              <SelectItem
                value='other'
                className='focus:bg-emerald-500/10 focus:text-emerald-400'
              >
                Outros
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Payment Type Toggle */}
      <div className='grid gap-2'>
        <Label className='text-zinc-400'>Tipo de Pagamento</Label>
        <Select
          value={paymentType}
          onValueChange={(val: 'paid' | 'pending') => setPaymentType(val)}
        >
          <SelectTrigger className='h-11 border-white/10 bg-white/5 rounded-xl'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='z-110 bg-zinc-950 border-white/10'>
            <SelectItem
              value='paid'
              className='focus:bg-emerald-500/10 focus:text-emerald-400'
            >
              À Vista (Já está pago)
            </SelectItem>
            <SelectItem
              value='pending'
              className='focus:bg-emerald-500/10 focus:text-emerald-400'
            >
              A Pagar (Agendar ou Parcelar)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Show Amount and Date if "Paid" (Simplified view) */}
      {paymentType === 'paid' && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300'>
          <div className='grid gap-2'>
            <Label htmlFor='amount' className='text-zinc-400'>
              Valor Pago (R$)
            </Label>
            <Input
              id='amount'
              name='amount'
              type='number'
              step='0.01'
              value={formData.amount}
              onChange={handleChange}
              className='h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
            />
          </div>
          <div className='grid gap-2'>
            <Label className='text-zinc-400'>Data do Pagamento</Label>
            <Input
              type='date'
              disabled
              value={today.toISOString().split('T')[0]}
              className='h-11 border-white/10 bg-white/5 rounded-xl opacity-50 cursor-not-allowed'
            />
          </div>
        </div>
      )}

      {/* Full Financial Section: Visible if "A Pagar" is selected */}
      {paymentType === 'pending' && (
        <div className='space-y-4 border-t border-dashed border-white/10 pt-4 animate-in fade-in duration-300'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='amount' className='text-zinc-400'>
                Valor (R$)
              </Label>
              <Input
                id='amount'
                name='amount'
                type='number'
                step='0.01'
                value={formData.amount}
                onChange={handleChange}
                className='h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='dueDate' className='text-zinc-400'>
                Vencimento
              </Label>
              <Input
                id='dueDate'
                name='dueDate'
                type='date'
                value={
                  formData.dueDate
                    ? new Date(formData.dueDate).toISOString().split('T')[0]
                    : ''
                }
                onChange={handleChange}
                className='h-11 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
              />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4 bg-white/2 p-4 rounded-2xl border border-dashed border-white/10'>
            <div className='flex items-center space-x-2'>
              <Switch
                id='is-installment'
                checked={(formData.totalInstallments || 0) > 1}
                onCheckedChange={(checked) =>
                  handleChange({
                    target: {
                      name: 'totalInstallments',
                      value: checked ? 2 : 1,
                    },
                  })
                }
              />
              <Label htmlFor='is-installment' className='text-zinc-300'>
                Parcelar?
              </Label>
            </div>

            {(formData.totalInstallments || 0) > 1 && (
              <div className='grid gap-2'>
                <Label
                  htmlFor='totalInstallments'
                  className='text-zinc-400 text-xs uppercase tracking-wider'
                >
                  Nº de Parcelas
                </Label>
                <Input
                  id='totalInstallments'
                  name='totalInstallments'
                  type='number'
                  min='2'
                  value={formData.totalInstallments ?? ''}
                  onChange={handleChange}
                  className='h-9 border-white/10 bg-white/5 rounded-lg'
                />
              </div>
            )}
          </div>

          <div className='flex items-center space-x-3 p-2'>
            <Switch
              id='isRecurring'
              checked={formData.isRecurring}
              onCheckedChange={(val) =>
                handleChange({ target: { name: 'isRecurring', value: val } })
              }
            />
            <Label htmlFor='isRecurring' className='text-zinc-300 font-medium'>
              Conta Recorrente (Mensal)
            </Label>
          </div>
        </div>
      )}

      <div className='grid gap-2'>
        <Label htmlFor='observations' className='text-zinc-400'>
          Observações
        </Label>
        <Textarea
          id='observations'
          name='observations'
          value={formData.observations}
          onChange={handleChange}
          placeholder='Detalhes do pagamento, referência, etc...'
          className='resize-none min-h-25 border-white/10 bg-white/5 rounded-xl focus:border-emerald-500/50 transition-all'
        />
      </div>
    </div>
  );
}
