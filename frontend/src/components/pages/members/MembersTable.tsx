import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Badge } from '../../ui/badge';
import { TableActions } from '@/components/shared/TableActions';
import { cn } from '@/lib/utils';
import type { IMember } from '@/interfaces/Member';
import { formatNameMobile } from '@/utils/formatName';

interface MembersTableProps {
  members: IMember[];
  filteredList: IMember[];
  prepareEdit: (member: IMember) => void;
  handleDelete?: (memberId: number) => void;
  handleIsActive?: (memberId: number) => void;
}

export function MembersTable({
  members,
  filteredList,
  prepareEdit,
  handleDelete,
  handleIsActive,
}: MembersTableProps) {
  return (
    <Table>
      <TableHeader className='bg-white/3'>
        <TableRow className='hover:bg-transparent border-white/5'>
          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 hidden lg:table-cell w-0'>
            Id
          </TableHead>

          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 pl-4 lg:pl-6 w-0'>
            <div className='xl:max-w-xs truncate'>Nome</div>
          </TableHead>

          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 hidden md:table-cell w-0'>
            <div className='md:max-w-35 xl:max-w-60 truncate'>Email</div>
          </TableHead>

          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 hidden lg:table-cell w-0'>
            CPF
          </TableHead>

          <TableHead className='text-[10px] uppercase font-black tracking-widest text-center text-zinc-500 py-4 hidden md:table-cell w-0'>
            Plano
          </TableHead>

          <TableHead className='text-[10px] uppercase font-black tracking-widest text-center text-zinc-500 py-4 w-0'>
            Status
          </TableHead>

          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 text-right pr-4 lg:pr-6 w-0'>
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {members.length > 0 ? (
          filteredList.map((member) => (
            <TableRow
              key={member.id}
              className='border-white/5 hover:bg-white/2 transition-colors'
            >
              <TableCell className='py-4 text-zinc-500 font-mono text-xs hidden lg:table-cell w-0'>
                #{member.id}
              </TableCell>

              <TableCell className='font-bold text-zinc-100 py-4 pl-4 lg:pl-6 align-middle w-0'>
                <div className='flex flex-col'>
                  <span className='lg:hidden text-sm'>
                    {formatNameMobile(member.name)}
                  </span>
                  <div className='hidden lg:block xl:max-w-xs truncate'>
                    {member.name}
                  </div>
                  <span className='text-[10px] text-zinc-500 lg:hidden font-mono'>
                    {member.cpf
                      ? member.cpf.replace(
                          /(\d{3})(\d{3})(\d{3})(\d{2})/,
                          '$1.$2.$3-$4',
                        )
                      : 'Sem CPF'}
                  </span>
                </div>
              </TableCell>

              <TableCell className='text-zinc-400 font-medium text-left hidden md:table-cell w-0'>
                <div className='md:max-w-35 xl:max-w-60 truncate'>
                  {member.email}
                </div>
              </TableCell>

              <TableCell className='text-zinc-400 font-medium text-left hidden lg:table-cell w-0 tabular-nums'>
                {member.cpf || '---'}
              </TableCell>

              <TableCell className='text-center hidden md:table-cell w-0'>
                <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/5 text-blue-400 border border-blue-500/10 text-[10px] font-bold uppercase'>
                  {member.plan?.name || 'Sem plano'}
                </span>
              </TableCell>

              <TableCell className='text-center w-0'>
                <Badge
                  variant='outline'
                  className={cn(
                    'rounded-full px-2 md:px-3 py-0.5 border-none font-bold text-[9px] md:text-[10px] uppercase tracking-tighter shadow-[0_0_10px_rgba(0,0,0,0.2)]',
                    member.isActive
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-zinc-800 text-zinc-500',
                  )}
                >
                  {member.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>

              <TableCell className='text-right pr-4 lg:pr-6 align-middle w-0'>
                <TableActions
                  isActive={member.isActive}
                  id={member.id!}
                  onHandleActive={() =>
                    member.id && handleIsActive?.(member.id)
                  }
                  onDelete={() => member.id && handleDelete?.(member.id)}
                  onEdit={() => prepareEdit(member)}
                  member={member}
                />
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={6}
              className='text-center h-48 text-zinc-600 font-medium italic'
            >
              Nenhum aluno encontrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
