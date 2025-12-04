'use client';

import React, { memo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  label?: string;
  showCount?: boolean;
  className?: string;
}

function FilterSelect({
  value,
  onChange,
  options,
  placeholder = 'Sélectionner...',
  label,
  showCount = false,
  className,
}: FilterSelectProps) {
  const selectedOption = options.find(opt => opt.value === value);
  const isActive = value && value !== 'all';

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn(
          "h-11 transition-all bg-background",
          isActive && "border-primary/60 ring-1 ring-primary/20"
        )}>
          <SelectValue placeholder={placeholder}>
            {selectedOption && (
              <div className="flex items-center justify-between w-full">
                <span className="text-sm">{selectedOption.label}</span>
                {showCount && selectedOption.count !== undefined && (
                  <Badge
                    variant={isActive ? "default" : "secondary"}
                    className="ml-2 min-w-[2rem] justify-center"
                  >
                    {selectedOption.count}
                  </Badge>
                )}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full gap-4">
                <span>{option.label}</span>
                {showCount && option.count !== undefined && (
                  <Badge
                    variant={option.value === value ? "default" : "secondary"}
                    className="ml-auto min-w-[2rem] justify-center"
                  >
                    {option.count}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default memo(FilterSelect);
