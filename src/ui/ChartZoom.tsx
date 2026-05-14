import { clamp } from './chartMath'

export function ChartZoomControl({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      <span>{label}</span>
      <input
        className="w-24 rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-slate-950 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white"
        type="number"
        min={1}
        max={20}
        step={0.5}
        value={value}
        onChange={(event) => onChange(clamp(Number(event.target.value) || 1, 1, 20))}
      />
      <span>x</span>
    </label>
  )
}
