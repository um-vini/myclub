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
import type { IUser } from '@/interfaces/User';

interface UsersTableProps {
  users: IUser[];
  prepareEdit: (user: IUser) => void;
  handleDelete?: (userId: number) => void;
  handleIsActive?: (userId: number) => void;
}

export function UsersTable({
  users,
  prepareEdit,
  handleDelete,
}: UsersTableProps) {
  console.log(users);
  return (
    <Table>
      <TableHeader className='bg-white/3'>
        <TableRow className='hover:bg-transparent border-white/5'>
          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 hidden md:table-cell w-0'>
            Id
          </TableHead>

          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 pl-4 md:pl-6 w-0'>
            <div className='xl:max-w-xs truncate'>Nome</div>
          </TableHead>

          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 hidden md:table-cell w-0'>
            <div className='xl:max-w-60 truncate'>Email</div>
          </TableHead>

          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 text-center w-0'>
            <span className='md:hidden'>Cat.</span>
            <span className='hidden md:inline'>Categoria</span>
          </TableHead>

          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 text-center hidden md:table-cell w-0'>
            Status
          </TableHead>

          <TableHead className='text-[10px] uppercase font-black tracking-widest text-zinc-500 py-4 text-right pr-4 md:pr-6 w-0'>
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {users.length > 0 ? (
          users.map((user) => (
            <TableRow
              key={user.id}
              className='border-white/5 hover:bg-white/2 transition-colors group'
            >
              <TableCell className='py-4 text-zinc-500 font-mono text-xs hidden md:table-cell w-0'>
                #{user.id}
              </TableCell>

              <TableCell className='font-bold text-zinc-100 py-4 pl-4 md:pl-6 align-middle w-0'>
                <div className='flex flex-col'>
                  <span className='xl:max-w-xs truncate'>{user.name}</span>
                  <span className='text-[10px] text-zinc-500 md:hidden truncate max-w-30'>
                    {user.email}
                  </span>
                </div>
              </TableCell>

              <TableCell className='text-zinc-400 font-medium text-left hidden md:table-cell w-0'>
                <div className='xl:max-w-60 truncate'>{user.email}</div>
              </TableCell>

              <TableCell className='text-center w-0'>
                <span
                  className={cn(
                    'text-[10px] font-black uppercase px-2 py-1 rounded-md border whitespace-nowrap',
                    user.isAdmin
                      ? 'text-amber-400 bg-amber-500/5 border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.05)]'
                      : 'text-zinc-400 bg-zinc-500/5 border-white/10',
                  )}
                >
                  <span className='md:hidden'>
                    {user.isAdmin ? 'Adm' : 'User'}
                  </span>
                  <span className='hidden md:inline'>
                    {user.isAdmin ? 'Administrador' : 'Usuário'}
                  </span>
                </span>
              </TableCell>

              <TableCell className='text-center hidden md:table-cell w-0'>
                <Badge
                  variant='outline'
                  className={cn(
                    'rounded-full px-3 py-0.5 border-none font-bold text-[10px] uppercase tracking-tighter shadow-[0_0_10px_rgba(0,0,0,0.2)]',
                    user.isActive
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-zinc-800 text-zinc-500',
                  )}
                >
                  {user.isActive ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>

              <TableCell className='text-right pr-4 md:pr-6 align-middle w-0'>
                <TableActions
                  isActive={user.isActive}
                  id={user.id ?? 0}
                  onDelete={() => user.id && handleDelete?.(user.id)}
                  onEdit={() => prepareEdit(user)}
                  user={user}
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
              Nenhum usuário encontrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
