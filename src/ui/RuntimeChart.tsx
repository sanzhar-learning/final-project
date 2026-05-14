import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AlgorithmResult } from '../pyodide/types'

export function RuntimeChart({ results }: { results: AlgorithmResult[] }) {
  if (!results.length) return null

  const data = results.map((result) => ({
    method: result.method,
    runtime: Number(result.runtime_ms.toFixed(4)),
  }))

  return (
    <section className="glass-card rounded-[2rem] p-5">
      <h3 className="mb-1 font-semibold text-slate-950 dark:text-white">Runtime by Method</h3>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">A time-based plot comparing how long each method took.</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="method" />
          <YAxis label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value) => [`${value} ms`, 'Runtime']} />
          <Bar dataKey="runtime" name="Runtime" fill="#4f46e5" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}
