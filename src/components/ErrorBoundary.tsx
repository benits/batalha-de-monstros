import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { PixelPanel } from './ui/PixelPanel'
import { Button } from './ui/Button'

type ErrorBoundaryProps = { children: ReactNode }
type ErrorBoundaryState = { error: Error | null }

/**
 * Rede de segurança de última instância. O estado vem de `localStorage`, que é
 * entrada não confiável — se algo escapar da validação na hidratação, o usuário
 * vê uma saída em vez de tela branca.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Falha não tratada na árvore de componentes', error, info)
  }

  private readonly resetStorage = () => {
    for (const key of ['revi:monsters', 'revi:battles', 'revi:settings']) {
      localStorage.removeItem(key)
    }
    location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="mx-auto max-w-[560px] px-6 py-12">
        <PixelPanel className="flex flex-col gap-4 p-6">
          <h1 className="text-amber text-[15px] font-bold tracking-[0.2em] uppercase">
            Algo quebrou
          </h1>
          <p className="text-dim text-[13px] leading-relaxed">
            A aplicação não conseguiu se recuperar. Recarregar costuma resolver; se não, limpar os
            dados salvos apaga o roster e volta ao estado inicial.
          </p>
          <pre className="bg-void text-rose overflow-x-auto p-3 text-[11px] shadow-[inset_0_0_0_2px_var(--color-edge-lo)]">
            {this.state.error.message}
          </pre>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => location.reload()}>Recarregar</Button>
            <Button variant="danger" onClick={this.resetStorage}>
              Limpar dados salvos
            </Button>
          </div>
        </PixelPanel>
      </div>
    )
  }
}
