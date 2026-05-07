import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Shield,
  ShieldOff,
  FilePlus,
  History,
  RotateCcw,
} from 'lucide-react';
import { PaymentHistoryModal } from './PaymentHistoryModal';
import { MemberActivity } from './MemberActivity';
import type { IMember } from '@/interfaces/Member';
import { ConfirmAction } from './ConfirmActions';
import type { IPlan } from '@/interfaces/Plan';
import type { IUser } from '@/interfaces/User';

interface TableActionsProps {
  id: number;
  isActive?: boolean;
  member?: IMember;
  plan?: IPlan;
  user?: IUser;
  onHandleActive?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onNew?: () => void;
  onCancel?: () => void;
  onHistory?: IMember;
}

export function TableActions({
  isActive,
  onHandleActive,
  onDelete,
  onEdit,
  onNew,
  onCancel,
  member,
  plan,
  user,
}: TableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Ações</DropdownMenuLabel>

        {/* Action to register a new related record */}
        {onNew && (
          <DropdownMenuItem className='gap-2' onClick={onNew}>
            <FilePlus className='size-3' /> Novo
          </DropdownMenuItem>
        )}

        {/* Standard edit action */}
        {onEdit && (
          <DropdownMenuItem className='gap-2' onClick={onEdit}>
            <Pencil className='size-3' /> Editar
          </DropdownMenuItem>
        )}

        {/* Member activity and payment history */}
        {member && (
          <PaymentHistoryModal
            trigger={
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()} // prevent menu from closing when modal opens
                className='gap-2'
              >
                <History className='size-3' /> Histórico
              </DropdownMenuItem>
            }
          >
            <MemberActivity memberId={member.id} />
          </PaymentHistoryModal>
        )}

        {/* Toggle active/inactive status with dynamic colors and confirmation */}
        {onHandleActive && (
          <ConfirmAction
            title={isActive ? `Inativar registro?` : `Reativar registro?`}
            description={
              isActive
                ? `Tem certeza que deseja inativar ${member?.name || plan?.name || user?.name}?`
                : `Tem certeza que deseja reativar ${member?.name || plan?.name || user?.name}?`
            }
            onConfirm={onHandleActive}
            variant={isActive ? 'destructive' : 'default'}
            trigger={
              <DropdownMenuItem
                className={`gap-2 ${isActive ? 'text-rose-400' : 'text-emerald-400'}`}
                onSelect={(e) => e.preventDefault()}
              >
                {isActive ? (
                  <>
                    <ShieldOff className='size-3' /> Inativar
                  </>
                ) : (
                  <>
                    <Shield className='size-3' /> Reativar
                  </>
                )}
              </DropdownMenuItem>
            }
          />
        )}

        <DropdownMenuSeparator />

        {/* Destructive delete action with confirmation */}
        {onDelete && (
          <ConfirmAction
            title='Excluir Registro?'
            description={`Tem certeza que deseja excluir permanentemente este registro? Esta ação não pode ser desfeita e os dados de ${member?.name || 'este item'} serão removidos.`}
            onConfirm={onDelete}
            variant='destructive'
            trigger={
              <DropdownMenuItem
                className='gap-2 text-destructive'
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 className='size-3' /> Excluir
              </DropdownMenuItem>
            }
          />
        )}

        {/* Cancel action (status: cancelled)*/}
        {onCancel && (
          <ConfirmAction
            title='Estornar?'
            description={`Deseja estornar o pagamento de ${member?.name} no valor de R$${member?.payment?.amountPaid} referente a ${member?.payment?.month}/${member?.payment?.year}?`}
            onConfirm={onCancel}
            trigger={
              <DropdownMenuItem
                className='text-amber-500'
                onSelect={(e) => e.preventDefault()}
              >
                <RotateCcw className='size-3' /> Estornar
              </DropdownMenuItem>
            }
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
