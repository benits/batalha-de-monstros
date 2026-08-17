import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { PixelPanel } from './PixelPanel'
import { Button } from './Button'

type ModalProps = {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export const Modal = ({ open, title, onClose, children }: ModalProps) => {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4"
      onClick={onClose}
    >
      <PixelPanel className="w-full max-w-md p-5" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-[13px] font-bold tracking-[0.2em] uppercase">{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Fechar" className="px-3 py-2">
            ✕
          </Button>
        </div>
        {children}
      </PixelPanel>
    </div>
  )
}
