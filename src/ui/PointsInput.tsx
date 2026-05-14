import type { ApproximationPoint } from '../pyodide/types'

type PointsInputProps = {
  points: ApproximationPoint[]
  onChange: (points: ApproximationPoint[]) => void
}

export function PointsInput({ points, onChange }: PointsInputProps) {
  function updatePoint(index: number, key: keyof ApproximationPoint, value: string) {
    const next = points.map((point) => ({ ...point }))
    next[index][key] = Number(value)
    onChange(next)
  }

  function addPoint() {
    const lastX = points.length ? points[points.length - 1].x : 0
    onChange([...points, { x: lastX + 1, y: 2 * (lastX + 1) + 1 }])
  }

  function generateNoisyLine() {
    const next = Array.from({ length: 10 }, (_, index) => {
      const x = index
      const noise = (Math.random() - 0.5) * 2.2
      return { x, y: 2 * x + 1 + noise }
    })
    onChange(next)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={generateNoisyLine}
          className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-500"
        >
          Generate noisy line
        </button>
        <button
          type="button"
          onClick={addPoint}
          className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Add point
        </button>
      </div>
      <div className="grid gap-2">
        <div className="grid grid-cols-[1fr_1fr_80px] gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span>x</span>
          <span>y</span>
          <span />
        </div>
        {points.map((point, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_80px] gap-2">
            <input className="input" type="number" value={point.x} onChange={(event) => updatePoint(index, 'x', event.target.value)} />
            <input className="input" type="number" value={point.y} onChange={(event) => updatePoint(index, 'y', event.target.value)} />
            <button
              type="button"
              onClick={() => onChange(points.filter((_, itemIndex) => itemIndex !== index))}
              className="rounded-2xl bg-rose-500/10 text-sm font-semibold text-rose-600 transition hover:bg-rose-500/20 dark:text-rose-300"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
