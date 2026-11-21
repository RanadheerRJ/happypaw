import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-xl border border-forest/15 bg-white px-3.5 text-[15px] text-charcoal shadow-[inset_0_1px_2px_rgba(31,61,43,0.04)] transition-colors placeholder:text-charcoal-400 focus:border-forest/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20 disabled:cursor-not-allowed disabled:bg-forest/[0.03] disabled:text-charcoal-500',
        'aria-[invalid=true]:border-red-500/60 aria-[invalid=true]:ring-red-500/15',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[110px] w-full resize-y rounded-xl border border-forest/15 bg-white px-3.5 py-3 text-[15px] leading-relaxed text-charcoal shadow-[inset_0_1px_2px_rgba(31,61,43,0.04)] transition-colors placeholder:text-charcoal-400 focus:border-forest/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20',
      'aria-[invalid=true]:border-red-500/60',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export { Input, Textarea };
