export type FilterFieldType = 'select' | 'date' | 'dateRange' | 'number' | 'numberRange';

export interface FilterSelectOption {
  label: string;
  value: string | boolean | number | null;
}

export interface FilterField {
  key: string;
  type: FilterFieldType;
  label: string;
  /** Показати у першому ряду (поза дропдауном). */
  popular?: boolean;
  options?: FilterSelectOption[];
  placeholder?: string;
  min?: number;
  max?: number;
  fractionDigits?: number;
}

export type FilterValues = Record<string, unknown>;
