import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger'
}

const VARIANT_CLASS = {
  primary:
    'bg-amber text-void shadow-[0_-3px_0_#C99716,0_3px_0_#C99716,-3px_0_0_#C99716,3px_0_0_#C99716]',
  ghost: 'bg-transparent text-dim hover:text-paper pixel-border',
  danger:
    'bg-rose text-void shadow-[0_-3px_0_#A81E3D,0_3px_0_#A81E3D,-3px_0_0_#A81E3D,3px_0_0_#A81E3D]',
} as const

export const Button = ({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonProps) => (
  <button
    type={type}
    {...props}
    className={cn(
      'cursor-pointer px-5 py-3 text-[11px] font-bold tracking-[0.18em] uppercase',
      'transition-transform hover:-translate-y-0.5 active:translate-y-px',
      'disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40',
      VARIANT_CLASS[variant],
      className,
    )}
  />
)
