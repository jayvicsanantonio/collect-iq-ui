// Button component using CollectIQ brand tokens
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-vault-blue)] text-white hover:bg-[var(--color-holo-cyan)] shadow-lg hover:shadow-xl hover:scale-[1.02]',
        secondary:
          'bg-[var(--color-holo-cyan)] text-white hover:bg-[var(--color-vault-blue)] shadow-md hover:shadow-lg',
        outline:
          'border-2 border-[var(--color-vault-blue)] bg-transparent text-[var(--color-vault-blue)] hover:bg-[var(--color-vault-blue)] hover:text-white dark:text-[var(--color-holo-cyan)] dark:border-[var(--color-holo-cyan)] dark:hover:bg-[var(--color-holo-cyan)] dark:hover:text-[var(--color-carbon-gray)]',
        ghost:
          'bg-transparent hover:bg-[var(--color-cloud-silver)] dark:hover:bg-[var(--color-graphite-gray)] text-[var(--foreground)]',
        gradient:
          'bg-gradient-to-r from-[var(--color-vault-blue)] to-[var(--color-holo-cyan)] text-white shadow-lg hover:shadow-xl hover:scale-[1.02]',
        success:
          'bg-[var(--color-emerald-glow)] text-[var(--color-carbon-gray)] hover:opacity-90 shadow-md',
        warning:
          'bg-[var(--color-amber-pulse)] text-[var(--color-carbon-gray)] hover:opacity-90 shadow-md',
        error: 'bg-[var(--color-crimson-red)] text-white hover:opacity-90 shadow-md',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
