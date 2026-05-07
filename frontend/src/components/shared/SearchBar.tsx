import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Field } from '../ui/field';
import { Input } from '../ui/input';

interface SearchBarProps {
  searchTerm: string;
  placeHolder: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SearchBar({
  searchTerm,
  placeHolder,
  onSearchChange,
}: SearchBarProps) {
  return (
    <Field className='flex-1'>
      <div className='flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10'>
        <Input
          id='search-input'
          placeholder={placeHolder}
          value={searchTerm}
          onChange={onSearchChange}
          className='border-none bg-transparent h-10 md:h-9 transition-all'
        />
        <Button
          variant='ghost'
          className='h-10 md:h-9 text-zinc-400 hover:text-white px-3 md:px-4'
        >
          <Search className='md:mr-2 h-4 w-4' />
          <span className='hidden md:inline'>Buscar</span>
        </Button>
      </div>
    </Field>
  );
}
