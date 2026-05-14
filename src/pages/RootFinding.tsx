import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { AlgorithmResult, PyodideStatus, RootFindingResponse } from '../pyodide/types'
import { callPy } from '../pyodide/runner'
import { ChartZoomControl } from '../ui/ChartZoom'
import { getNumericExtent, getZoomDomain } from '../ui/chartMath'
import { ComparisonTable } from '../ui/ComparisonTable'
import { MathInput } from '../ui/MathInput'
import { ResultCard } from '../ui/ResultCard'
import { RuntimeChart } from '../ui/RuntimeChart'
import { Spinner } from '../ui/Spinner'
import { VerdictCard } from '../ui/VerdictCard'

const colors = ['#4f46e5', '#0891b2', '#10b981']

export function RootFinding({ pyodideStatus }: { pyodideStatus: PyodideStatus }) {
  const [functionExpr, setFunctionExpr] = useState('x**2 - 3')
  const [gExpr, setGExpr] = useState('0.5 * (x + 3 / x)')
  const [a, setA] = useState(1)
  const [b, setB] = useState(2)
  const [x0, setX0] = useState(1.5)
  const [tol, setTol] = useState(0.000001)
  const [maxIter, setMaxIter] = useState(50)
  const [methods, setMethods] = useState(['bisection', 'newton', 'fixed_point'])
  const [response, setResponse] = useState<RootFindingResponse | null>(null)
  const [functionZoom, setFunctionZoom] = useState(1)
  const [convergenceZoom, setConvergenceZoom] = useState(1)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runComparison() {
    setRunning(true)
    setError(null)
    try {
      const data = await callPy<RootFindingResponse>('root_finding', 'run_root_finding', {
        function_expr: functionExpr,
        g_expr: gExpr,
        a,
        b,
        x0,
        tol,
        max_iter: maxIter,
        methods,
      })
      setResponse(data)
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : String(exc))
    } finally {
      setRunning(false)
    }
  }

  const results = response?.results ?? []
  const convergenceData = buildConvergenceData(results)
  const functionDomain = getZoomDomain(a, b, functionZoom)
  const convergenceDomain = getZoomDomain(
    ...getNumericExtent(convergenceData.map((row) => Number(row.k))),
    convergenceZoom,
  )

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-[2rem] p-6">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Module 1</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">Root-Finding Algorithms</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Find x such that f(x) = 0, then compare accuracy, iterations, runtime, and reliability.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <div className="grid gap-5 md:grid-cols-2">
            <MathInput label="Function f(x)" value={functionExpr} onChange={setFunctionExpr} helper="Use Python syntax: x**2, sin(x), sqrt(x), exp(x)." />
            <MathInput label="Fixed-point g(x)" value={gExpr} onChange={setGExpr} helper="For x^2 - 3, g(x)=0.5*(x+3/x) works well." />
            <NumberInput label="Interval start a" value={a} onChange={setA} />
            <NumberInput label="Interval end b" value={b} onChange={setB} />
            <NumberInput label="Starting point x0" value={x0} onChange={setX0} />
            <NumberInput label="Tolerance epsilon" value={tol} onChange={setTol} step={0.000001} />
            <NumberInput label="Maximum iterations" value={maxIter} onChange={setMaxIter} step={1} />
          </div>

          <div className="rounded-3xl bg-slate-100/70 p-5 dark:bg-slate-900/70">
            <h3 className="font-semibold text-slate-950 dark:text-white">Algorithms</h3>
            <div className="mt-4 grid gap-3">
              <MethodCheckbox label="Bisection" value="bisection" methods={methods} setMethods={setMethods} />
              <MethodCheckbox label="Newton" value="newton" methods={methods} setMethods={setMethods} />
              <MethodCheckbox label="Fixed Point" value="fixed_point" methods={methods} setMethods={setMethods} />
            </div>
            <button
              type="button"
              disabled={running || pyodideStatus !== 'ready'}
              onClick={runComparison}
              className="mt-6 w-full rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {running ? <Spinner label="Running..." /> : 'Run comparison'}
            </button>
            {error && <p className="mt-4 rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-300">{error}</p>}
          </div>
        </div>
      </section>

      {results.length > 0 && (
        <>
          <section className="grid gap-5 lg:grid-cols-3">
            {results.map((result, index) => (
              <ResultCard key={result.method} result={result} index={index} />
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <ChartCard title="Function and Root Positions" zoom={<ChartZoomControl label="Zoom" value={functionZoom} onChange={setFunctionZoom} />}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={response?.function_points ?? []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="x" type="number" domain={functionDomain} />
                  <YAxis />
                  <Tooltip />
                  <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                  {results.map((result, index) =>
                    typeof result.result === 'number' && result.converged ? (
                      <ReferenceLine key={result.method} x={result.result} stroke={colors[index % colors.length]} label={result.method} />
                    ) : null,
                  )}
                  <Line type="monotone" dataKey="y" name="f(x)" stroke="#4f46e5" dot={false} strokeWidth={2} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Convergence History" zoom={<ChartZoomControl label="Zoom" value={convergenceZoom} onChange={setConvergenceZoom} />}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={convergenceData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="k" type="number" domain={convergenceDomain} />
                  <YAxis />
                  <Tooltip />
                  {results.map((result, index) => (
                    <Line key={result.method} type="monotone" dataKey={result.method} stroke={colors[index % colors.length]} dot={false} strokeWidth={2} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </section>

          <RuntimeChart results={results} />
          <VerdictCard results={results} />
          <ComparisonTable results={results} />
        </>
      )}
    </div>
  )
}

function NumberInput({ label, value, onChange, step = 0.1 }: { label: string; value: number; onChange: (value: number) => void; step?: number }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <input className="input mt-2" type="number" step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

function MethodCheckbox({
  label,
  value,
  methods,
  setMethods,
}: {
  label: string
  value: string
  methods: string[]
  setMethods: (methods: string[]) => void
}) {
  const checked = methods.includes(value)
  return (
    <label className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 text-sm font-semibold dark:bg-slate-950/60">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          if (event.target.checked) setMethods([...methods, value])
          else setMethods(methods.filter((item) => item !== value))
        }}
      />
      {label}
    </label>
  )
}

function ChartCard({ title, zoom, children }: { title: string; zoom?: ReactNode; children: ReactNode }) {
  return (
    <div className="glass-card rounded-[2rem] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-950 dark:text-white">{title}</h3>
        {zoom}
      </div>
      {children}
    </div>
  )
}

function buildConvergenceData(results: AlgorithmResult[]) {
  const rows = new Map<number, Record<string, number | null>>()
  for (const result of results) {
    for (const item of result.history) {
      const k = Number(item.k)
      const error = typeof item.error === 'number' ? item.error : null
      rows.set(k, { ...(rows.get(k) ?? { k }), [result.method]: error })
    }
  }
  return [...rows.values()].sort((left, right) => Number(left.k) - Number(right.k))
}
