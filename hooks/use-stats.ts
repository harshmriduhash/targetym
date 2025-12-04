import { useMemo } from 'react';

export interface StatCalculator<T> {
  label: string;
  calculate: (items: T[]) => number | string;
  icon?: any;
  iconColor?: string;
  description?: (value: number | string) => string;
}

export function useStats<T>(
  items: T[],
  calculators: StatCalculator<T>[]
) {
  return useMemo(() => {
    return calculators.map((calculator) => {
      const value = calculator.calculate(items);
      return {
        label: calculator.label,
        value,
        icon: calculator.icon,
        iconColor: calculator.iconColor,
        description: calculator.description
          ? calculator.description(value)
          : undefined,
      };
    });
  }, [items, calculators]);
}
