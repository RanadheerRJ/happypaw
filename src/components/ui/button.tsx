import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 ease-out-quart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/70 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-forest text-cream shadow-soft hover:bg-forest-800 hover:shadow-card',
        accent:
          'bg-terracotta-500 text-white shadow-soft hover:bg-terracotta-600 hover:shadow-card',
        outline:
          'border border-forest/20 bg-transparent text-forest hover:border-forest/40 hover:bg-forest/[0.04]',
        soft: 'bg-forest/[0.06] text-forest hover:bg-forest/[0.1]',
        sage: 'bg-sage-200 text-forest-800 hover:bg-sage-300',
        ghost: 'text-forest hover:bg-forest/[0.06]',
        link: 'text-forest underline decoration-sage-400 underline-offset-4 hover:decoration-forest',
        destructive: 'bg-red-700 text-white hover:bg-red-800',
      },
      size: {
        sm: 'h-9 px-4 text-[13px]',
        default: 'h-11 px-5 text-[15px]',
        lg: 'h-[52px] px-7 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...(asChild ? {} : { type: type ?? 'button' })}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
