import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ELEMENT_CYCLE, type Monster, type MonsterDraft } from '@/domain/monster/monster.types'
import { monsterDraftSchema, type MonsterDraftInput } from '@/domain/monster/monster.schema'
import { levelOf } from '@/domain/monster/monster.rules'
import { unlockedPowers } from '@/domain/powers/powers.rules'
import { ELEMENTS } from '@/domain/powers/elements'
import { PixelPanel } from '@/components/ui/PixelPanel'
import { Button } from '@/components/ui/Button'
import { CONTROL_CLASS, Field } from '@/components/ui/Field'
import { Sprite } from '@/components/ui/Sprite'
import { STAT_FULL_LABEL, STAT_KEYS } from '@/domain/monster/stats'
import { SpriteGallery } from './SpriteGallery'

const EMPTY: MonsterDraft = {
  name: '',
  attack: 30,
  defense: 20,
  speed: 20,
  hp: 90,
  imageUrl: '',
  element: 'fogo',
}

type MonsterFormProps = {
  editing?: Monster
  onSubmit: (draft: MonsterDraft) => void
  onCancel?: () => void
}

export const MonsterForm = ({ editing, onSubmit, onCancel }: MonsterFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MonsterDraftInput>({
    resolver: zodResolver(monsterDraftSchema),
    defaultValues: editing ?? EMPTY,
  })

  const draft = watch()
  const preview: Monster = { ...EMPTY, ...draft, id: 'preview' }
  const powers = unlockedPowers(preview.element, levelOf(preview))

  const submit = handleSubmit((values) => {
    onSubmit(values)
    if (!editing) reset(EMPTY)
  })

  return (
    <PixelPanel as="form" className="flex flex-col gap-3 p-4" onSubmit={submit} noValidate>
      <p className="text-dim text-[10px] tracking-[0.2em] uppercase">
        {editing ? 'Editar monstro' : 'Cadastrar monstro'}
      </p>

      <Field label="Nome" error={errors.name?.message} {...register('name')} />

      <div className="grid grid-cols-2 gap-3">
        {STAT_KEYS.map((stat) => (
          <Field
            key={stat}
            label={STAT_FULL_LABEL[stat]}
            type="number"
            error={errors[stat]?.message}
            {...register(stat, { valueAsNumber: true })}
          />
        ))}
      </div>

      <Field label="Elemento" error={errors.element?.message}>
        <select {...register('element')} className={CONTROL_CLASS}>
          {ELEMENT_CYCLE.map((element) => (
            <option key={element} value={element}>
              {ELEMENTS[element].label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="image_url"
        placeholder="https://… (opcional)"
        error={errors.imageUrl?.message}
        {...register('imageUrl')}
      />

      <SpriteGallery
        seed={draft.name ?? ''}
        element={preview.element}
        value={draft.imageUrl ?? ''}
        onPick={(url) => setValue('imageUrl', url, { shouldValidate: true })}
      />

      <div className="bg-void flex items-center gap-3 p-3 shadow-[inset_0_0_0_2px_var(--color-edge-lo)]">
        <Sprite
          name={draft.name || '?'}
          element={preview.element}
          imageUrl={draft.imageUrl}
          size={48}
        />
        <p className="text-dim text-[11px] leading-snug">
          Nível {levelOf(preview)} · {powers.length}{' '}
          {powers.length === 1 ? 'poder destravado' : 'poderes destravados'}
          <br />
          {powers.map((power) => power.name).join(' · ')}
        </p>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {editing ? 'Salvar alterações' : 'Salvar monstro'}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </PixelPanel>
  )
}
