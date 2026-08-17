import { useCallback } from 'react'
import { useSettingsStore } from '@/store/settings.store'
import { playSfx, type SfxName } from './sfx'

/** Único ponto que decide se o som toca. Componentes só dizem o que aconteceu. */
export const useSfx = () => {
  const muted = useSettingsStore((state) => state.muted)

  return useCallback(
    (name: SfxName) => {
      if (!muted) playSfx(name)
    },
    [muted],
  )
}
