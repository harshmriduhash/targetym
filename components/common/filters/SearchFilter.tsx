'use client';

import React, { memo, useRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
  autoFocus?: boolean;
  /**
   * Debounce delay in milliseconds (default: 300ms)
   * Set to 0 to disable debouncing
   */
  debounceDelay?: number;
}

function SearchFilter({
  value,
  onChange,
  placeholder = 'Rechercher...',
  className,
  isLoading = false,
  autoFocus = false,
  debounceDelay = 300,
}: SearchFilterProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, debounceDelay);

  // Sync debounced value with parent
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  // Sync external value changes
  useEffect(() => {
    if (value !== localValue && value !== debouncedValue) {
      setLocalValue(value);
    }
  }, [value, localValue, debouncedValue]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  };

  const isDebouncing = debounceDelay > 0 && localValue !== debouncedValue;

  return (
    <div className={cn("relative group", className)}>
      <Search className={cn(
        "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors pointer-events-none",
        localValue ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
      )} />
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className={cn(
          "h-11 pl-10 transition-all bg-background",
          localValue && "pr-10 ring-1 ring-primary/20"
        )}
        autoFocus={autoFocus}
        aria-label={placeholder}
      />
      {(isLoading || isDebouncing) && (
        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
      )}
      {localValue && !isLoading && !isDebouncing && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Effacer la recherche"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

export default memo(SearchFilter);
