import { useState } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { callPy } from '../pyodide/runner'
import type { AlgorithmResult, ApproximationPoint, PyodideStatus } from '../pyodide/types'
import { ChartZoomControl } from '../ui/ChartZoom'
import { getNumericExtent, getZoomDomain } from '../ui/chartMath'
import { ComparisonTable } from '../ui/ComparisonTable'
import { PointsInput } from '../ui/PointsInput'
import { ResultCard } from '../ui/ResultCard'
import { RuntimeChart } from '../ui/RuntimeChart'
import { Spinner } from '../ui/Spinner'
import { VerdictCard } from '../ui/VerdictCard'

const colors = ['#4f46e5', '#0891b2', '#10b981']

export function Approximation({ pyodideStatus }: { pyodideStatus: PyodideStatus }) {
  const [points, setPoints] = useState<ApproximationPoint[]>([
    { x: 0, y: 1.2 },
    { x: 1, y: 3.1 },
    { x: 2, y: 4.8 },
    { x: 3, y: 7.4 },
    { x: 4, y: 8.7 },
    { x: 5, y: 11.2 },
  ])
  const [degree, setDegree] = useState(2)
  const [methods, setMethods] = useState(['interpolation', 'least_squares', 'linear_regression'])
  const [results, setResults] = useState<AlgorithmResult[]>([])
  const [fitZoom, setFitZoom] = useState(1)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runComparison() {
    setRunning(true)
    setError(null)
    try {
      const data = await callPy<{ results: AlgorithmResult[] }>('approximation', 'run_approximation', {
        xs: points.map((point) => point.x),
        ys: points.map((point) => point.y),
        degree,
        methods,
      })
      setResults(data.results)
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : String(exc))
    } finally {
      setRunning(false)
    }
  }

  const fitDomain = getZoomDomain(...getNumericExtent(points.map((point) => point.x)), fitZoom)

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-[2rem] p-6">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Module 3</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">Approximation & Interpolation</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Build functions from points and compare exact interpolation with least-squares approximations.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <PointsInput points={points} onChange={setPoints} />
          <div className="rounded-3xl bg-slate-100/70 p-5 dark:bg-slate-900/70">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Least squares degree</span>
              <input className="input mt-2" type="number" min={1} max={Math.max(points.length - 1, 1)} value={degree} onChange={(event) => setDegree(Number(event.target.value))} />
            </label>
            <h3 className="mt-5 font-semibold text-slate-950 dark:text-white">Methods</h3>
            <div className="mt-4 grid gap-3">
              <MethodCheckbox label="Polynomial Interpolation" value="interpolation" methods={methods} setMethods={setMethods} />
              <MethodCheckbox label="Least Squares" value="least_squares" methods={methods} setMethods={setMethods} />
              <MethodCheckbox label="Linear Regression" value="linear_regression" methods={methods} setMethods={setMethods} />
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

          <section className="glass-card rounded-[2rem] p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-slate-950 dark:text-white">Original Points and Generated Functions</h3>
              <ChartZoomControl label="Zoom" value={fitZoom} onChange={setFitZoom} />
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <ComposedChart>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="x" type="number" domain={fitDomain} />
                <YAxis />
                <Tooltip />
                <Scatter name="Data points" data={points} dataKey="y" fill="#f97316" />
                {results.map((result, index) => (
                  <Line
                    key={result.method}
                    name={result.method}
                    data={result.history}
                    type="monotone"
                    dataKey="y"
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </section>

          <RuntimeChart results={results} />
          <VerdictCard results={results} />
          <ComparisonTable results={results} />
        </>
      )}
    </div>
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
