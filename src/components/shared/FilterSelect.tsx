import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterSelectProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

/** 篩選下拉選單；label 作為無障礙名稱。 */
export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className="w-full min-w-[160px] sm:w-auto"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
