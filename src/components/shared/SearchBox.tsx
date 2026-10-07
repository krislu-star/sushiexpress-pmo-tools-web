import { Search, X } from 'lucide-react';

interface SearchBoxProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

/** 搜尋欄，有內容時顯示清除按鈕。 */
export function SearchBox({
  label,
  placeholder,
  value,
  onChange,
}: SearchBoxProps) {
  return (
    <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-radius-6 border border-border-primary bg-surface-secondary px-3 focus-within:ring-2 focus-within:ring-border-third focus-within:ring-offset-2 sm:min-w-[280px]">
      <Search
        aria-hidden
        className="h-[18px] w-[18px] shrink-0 text-icon-secondary"
      />
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-text-primary outline-none word-body placeholder:text-text-default [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          aria-label="清除搜尋"
          onClick={() => onChange('')}
          className="text-icon-secondary hover:text-icon-primary"
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
