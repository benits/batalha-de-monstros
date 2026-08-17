import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  children?: ReactNode
}

export const CONTROL_CLASS =
  'bg-void text-paper px-2.5 py-2 text-[13px] outline-none shadow-[inset_0_0_0_2px_var(--color-edge-lo)]'

export const Field = ({ label, error, children, className, ...props }: FieldProps) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-dim text-[10px] tracking-[0.2em] uppercase">{label}</span>
    {children ?? (
      <input
        {...props}
        className={cn(
          CONTROL_CLASS,
          'focus:shadow-[inset_0_0_0_2px_var(--color-amber)]',
          error && 'shadow-[inset_0_0_0_2px_var(--color-rose)]',
          className,
        )}
      />
    )}
    {error && <span className="text-rose text-[11px]">{error}</span>}
  </label>
)
