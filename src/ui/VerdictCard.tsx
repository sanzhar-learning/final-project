import { Trophy } from 'lucide-react'
import type { AlgorithmResult } from '../pyodide/types'
import { formatNumber } from './format'

export function VerdictCard({ results }: { results: AlgorithmResult[] }) {
  const converged = results.filter((result) => result.converged)
  if (!converged.length) return null

  const byError = minBy(converged, (result) => result.error)
  const byRuntime = minBy(converged, (result) => result.runtime_ms)
  const byIterations = minBy(
    converged.filter((result) => result.iterations !== null),
    (result) => result.iterations,
  )

  return (
    <div className="glass-card rounded-3xl p-5">
      <div className="flex items-center gap-2 text-slate-950 dark:text-white">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h3 className="font-semibold">Quick Verdict</h3>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Verdict label="Most accurate" value={byError ? `${byError.method} (${formatNumber(byError.error)})` : '-'} />
        <Verdict label="Fastest runtime" value={byRuntime ? `${byRuntime.method} (${formatNumber(byRuntime.runtime_ms, 3)} ms)` : '-'} />
        <Verdict label="Fewest iterations" value={byIterations ? `${byIterations.method} (${byIterations.iterations})` : '-'} />
      </div>
    </div>
  )
}

function Verdict({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-indigo-500/10 p-4">
      <p className="text-xs uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{label}</p>
      <p className="mt-2 font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  )
}

function minBy<T>(items: T[], selector: (item: T) => number | null | undefined) {
  return items.reduce<T | null>((best, item) => {
    const value = selector(item)
    if (value === null || value === undefined || Number.isNaN(value)) return best
    if (!best) return item
    const bestValue = selector(best)
    if (bestValue === null || bestValue === undefined || Number.isNaN(bestValue)) return item
    return value < bestValue ? item : best
  }, null)
}
