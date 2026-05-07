import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Months definition for the filter in Portuguese
const months = [
  { id: 1, name: 'Janeiro' },
  { id: 2, name: 'Fevereiro' },
  { id: 3, name: 'Março' },
  { id: 4, name: 'Abril' },
  { id: 5, name: 'Maio' },
  { id: 6, name: 'Junho' },
  { id: 7, name: 'Julho' },
  { id: 8, name: 'Agosto' },
  { id: 9, name: 'Setembro' },
  { id: 10, name: 'Outubro' },
  { id: 11, name: 'Novembro' },
  { id: 12, name: 'Dezembro' },
];

interface PerioSelectProps {
  initialData: {
    selectedMonth: number;
    selectedYear: number;
  };
  onPeriodChange: (month: number, year: number) => void;
}

export function PeriodSelect({
  initialData,
  onPeriodChange,
}: PerioSelectProps) {
  const month = String(initialData.selectedMonth);
  const year = String(initialData.selectedYear);

  // Generate dynamic year range based on current date
  const currentYear = new Date().getFullYear();
  const years = [
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
  ];

  return (
    <div className='flex gap-2 h-full'>
      {/* Month selection dropdown */}
      <div className='flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 w-full'>
        <Select
          value={month}
          onValueChange={(val) => {
            onPeriodChange(Number(val), Number(year));
          }}
        >
          <SelectTrigger className='w-full h-9! border-none bg-transparent hover:bg-white/5 transition-all rounded-lg'>
            <SelectValue placeholder='Mês' />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {months.map((m) => (
                <SelectItem
                  className='rounded-lg'
                  key={m.id}
                  value={String(m.id)}
                >
                  {m.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Year selection dropdown */}
      <div className='flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 w-full'>
        <Select
          value={year}
          onValueChange={(val) => {
            onPeriodChange(Number(month), Number(val));
          }}
        >
          <SelectTrigger className='w-full h-9! border-none bg-transparent hover:bg-white/5 transition-all rounded-lg'>
            <SelectValue placeholder='Ano' />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {years.map((y) => (
                <SelectItem className='rounded-lg' key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
