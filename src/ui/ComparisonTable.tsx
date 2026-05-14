import { useMemo, useState } from 'react'
import type { AlgorithmResult } from '../pyodide/types'
import { formatNumber, formatResult } from './format'

export function ComparisonTable({ results }: { results: AlgorithmResult[] }) {
  const [sortKey, setSortKey] = useState<keyof AlgorithmResult>('runtime_ms')
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc')

  const sortedResults = useMemo(() => {
    return [...results].sort((left, right) => {
      const leftValue = left[sortKey]
      const rightValue = right[sortKey]
      const result = compareValues(leftValue, rightValue)
      return direction === 'asc' ? result : -result
    })
  }, [direction, results, sortKey])

  if (!results.length) return null

  function updateSort(key: keyof AlgorithmResult) {
    if (sortKey === key) {
      setDirection((value) => (value === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setDirection('asc')
    }
  }

  return (
    <div className="glass-card overflow-hidden rounded-3xl">
      <div className="border-b border-slate-200/70 px-5 py-4 dark:border-slate-700/60">
        <h3 className="font-semibold text-slate-950 dark:text-white">Comparison Table</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">All methods return the same result format.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-slate-100/70 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
            <tr>
              <SortableHeader label="Method" sortKey="method" activeKey={sortKey} direction={direction} onSort={updateSort} />
              <th className="px-5 py-3">Result</th>
              <SortableHeader label="Error" sortKey="error" activeKey={sortKey} direction={direction} onSort={updateSort} />
              <SortableHeader label="Residual" sortKey="residual" activeKey={sortKey} direction={direction} onSort={updateSort} />
              <SortableHeader label="Iterations" sortKey="iterations" activeKey={sortKey} direction={direction} onSort={updateSort} />
              <SortableHeader label="Runtime" sortKey="runtime_ms" activeKey={sortKey} direction={direction} onSort={updateSort} />
              <SortableHeader label="Status" sortKey="converged" activeKey={sortKey} direction={direction} onSort={updateSort} />
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((result) => (
              <tr key={result.method} className="border-t border-slate-200/60 dark:border-slate-700/50">
                <td className="px-5 py-4 font-medium text-slate-950 dark:text-white">{result.method}</td>
                <td className="max-w-[280px] px-5 py-4 font-mono text-xs">{formatResult(result.result)}</td>
                <td className="px-5 py-4">{formatNumber(result.error)}</td>
                <td className="px-5 py-4">{formatNumber(result.residual)}</td>
                <td className="px-5 py-4">{result.iterations ?? '-'}</td>
                <td className="px-5 py-4">{formatNumber(result.runtime_ms, 3)} ms</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      result.converged
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {result.converged ? 'Converged' : 'Failed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onSort,
}: {
  label: string
  sortKey: keyof AlgorithmResult
  activeKey: keyof AlgorithmResult
  direction: 'asc' | 'desc'
  onSort: (key: keyof AlgorithmResult) => void
}) {
  const active = sortKey === activeKey
  return (
    <th className="px-5 py-3">
      <button type="button" onClick={() => onSort(sortKey)} className="inline-flex items-center gap-1 font-semibold">
        {label}
        <span className="text-[10px]">{active ? (direction === 'asc' ? '^' : 'v') : '-'}</span>
      </button>
    </th>
  )
}

function compareValues(left: unknown, right: unknown) {
  if (left === null || left === undefined) return 1
  if (right === null || right === undefined) return -1
  if (typeof left === 'number' && typeof right === 'number') return left - right
  if (typeof left === 'boolean' && typeof right === 'boolean') return Number(right) - Number(left)
  return String(left).localeCompare(String(right))
}
