import { motion } from 'framer-motion'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { AlgorithmResult } from '../pyodide/types'
import { formatNumber, formatResult } from './format'

type ResultCardProps = {
  result: AlgorithmResult
  index: number
}

export function ResultCard({ result, index }: ResultCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.22 }}
      className="glass-card rounded-3xl p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{result.method}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{result.notes}</p>
        </div>
        {result.converged ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <XCircle className="h-5 w-5 text-rose-500" />
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Metric label="Result" value={formatResult(result.result)} />
        <Metric label="Error" value={formatNumber(result.error)} />
        <Metric label="Residual" value={formatNumber(result.residual)} />
        <Metric label="Iterations" value={result.iterations ?? '-'} />
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Clock className="h-4 w-4" />
        {formatNumber(result.runtime_ms, 3)} ms
      </div>

      {result.failure_reason && (
        <p className="mt-3 rounded-2xl bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">
          {result.failure_reason}
        </p>
      )}
    </motion.article>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-100/70 p-3 dark:bg-slate-900/70">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 break-words font-semibold text-slate-950 dark:text-white">{value}</div>
    </div>
  )
}
