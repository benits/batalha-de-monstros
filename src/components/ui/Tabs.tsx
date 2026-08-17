import { useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { cn } from '@/lib/cn'

export type Tab<T extends string> = { id: T; label: string }

type TabsProps<T extends string> = {
  tabs: Tab<T>[]
  active: T
  onChange: (id: T) => void
  label: string
  className?: string
}

/**
 * Tablist com navegação por teclado conforme o padrão ARIA: setas movem entre
 * abas, Home e End vão para as pontas. Sem isso, `role="tab"` é só enfeite.
 */
export const Tabs = <T extends string>({
  tabs,
  active,
  onChange,
  label,
  className,
}: TabsProps<T>) => {
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  const focusTab = (index: number) => {
    const wrapped = (index + tabs.length) % tabs.length
    onChange(tabs[wrapped].id)
    buttons.current[wrapped]?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = tabs.findIndex((tab) => tab.id === active)
    const moves: Record<string, number | undefined> = {
      ArrowRight: current + 1,
      ArrowLeft: current - 1,
      Home: 0,
      End: tabs.length - 1,
    }
    const next = moves[event.key]
    if (next === undefined) return
    event.preventDefault()
    focusTab(next)
  }

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className={cn('flex flex-wrap items-center gap-1', className)}>
      {tabs.map((tab, index) => {
        const selected = tab.id === active
        return (
          <button
            key={tab.id}
            ref={(node) => {
              buttons.current[index] = node
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              'pixel-border-lo cursor-pointer px-4 py-2.5 text-[11px] tracking-[0.18em] uppercase',
              'transition-transform hover:-translate-y-0.5',
              /* O hover não pode reescrever a cor do estado selecionado: texto
                 claro sobre âmbar fica ilegível. */
              selected ? 'bg-amber text-void' : 'bg-panel-hi text-dim hover:text-paper',
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
