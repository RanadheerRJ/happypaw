import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
}

/**
 * A native <select> styled to match the system. Native controls are more
 * reliable on mobile and fully keyboard/screen-reader accessible.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'h-11 w-full appearance-none rounded-xl border border-forest/15 bg-white px-3.5 pr-10 text-[15px] text-charcoal transition-colors focus:border-forest/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20 disabled:bg-forest/[0.03] disabled:text-charcoal-500',
          !props.value && !props.defaultValue && placeholder ? 'text-charcoal-400' : '',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-500"
        aria-hidden="true"
      />
    </div>
  ),
);
Select.displayName = 'Select';
