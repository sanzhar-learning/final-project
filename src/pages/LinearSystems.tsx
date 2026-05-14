import { useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { callPy } from '../pyodide/runner'
import type { AlgorithmResult, PyodideStatus } from '../pyodide/types'
import { ChartZoomControl } from '../ui/ChartZoom'
import { getNumericExtent, getZoomDomain } from '../ui/chartMath'
import { ComparisonTable } from '../ui/ComparisonTable'
import { MatrixInput } from '../ui/MatrixInput'
import { ResultCard } from '../ui/ResultCard'
import { RuntimeChart } from '../ui/RuntimeChart'
import { Spinner } from '../ui/Spinner'
import { VerdictCard } from '../ui/VerdictCard'

const colors = ['#4f46e5', '#0891b2', '#10b981']

export function LinearSystems({ pyodideStatus }: { pyodideStatus: PyodideStatus }) {
  const [matrix, setMatrix] = useState([
    [4, 1, 2],
    [1, 5, 1],
    [2, 1, 3],
  ])
  const [vector, setVector] = useState([4, 6, 7])
  const [tol, setTol] = useState(0.000001)
  const [maxIter, setMaxIter] = useState(100)
  const [methods, setMethods] = useState(['gaussian', 'jacobi', 'gauss_seidel'])
  const [results, setResults] = useState<AlgorithmResult[]>([])
  const [residualZoom, setResidualZoom] = useState(1)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function runComparison() {
    setRunning(true)
    setError(null)
    try {
      const data = await callPy<{ results: AlgorithmResult[] }>('linear_systems', 'run_linear_systems', {
        A: matrix,
        b: vector,
        tol,
        max_iter: maxIter,
        methods,
      })
      setResults(data.results)
    } catch (exc) {
      setError(exc instanceof Error ? exc.message : String(exc))
    } finally {
      setRunning(false)
    }
  }

  const residualData = buildResidualData(results)
  const residualDomain = getZoomDomain(...getNumericExtent(residualData.map((row) => Number(row.k))), residualZoom)

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-[2rem] p-6">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Module 2</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">Systems of Linear Equations</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Solve Ax = b and compare a direct method with two simple iterative methods.
          </p>
        </div>

        <div className="mb-5 rounded-3xl bg-slate-100/70 p-5 dark:bg-slate-900/70">
          <h3 className="font-semibold text-slate-950 dark:text-white">Random matrix generator</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Creates diagonally dominant systems so Jacobi and Gauss-Seidel have a good chance to converge.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {[10, 50, 100].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  const system = generateRandomSystem(size)
                  setMatrix(system.matrix)
                  setVector(system.vector)
                  setResults([])
                  setMaxIter(Math.max(100, size * 2))
                }}
                className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:bg-indigo-500"
              >
                Generate {size}x{size}
              </button>
            ))}
          </div>
        </div>

        <MatrixInput matrix={matrix} vector={vector} onMatrixChange={setMatrix} onVectorChange={setVector} />

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-4 md:grid-cols-2">
            <NumberInput label="Tolerance epsilon" value={tol} onChange={setTol} step={0.000001} />
            <NumberInput label="Maximum iterations" value={maxIter} onChange={setMaxIter} step={1} />
          </div>
          <div className="rounded-3xl bg-slate-100/70 p-5 dark:bg-slate-900/70">
            <h3 className="font-semibold text-slate-950 dark:text-white">Algorithms</h3>
            <div className="mt-4 grid gap-3">
              <MethodCheckbox label="Gaussian Elimination" value="gaussian" methods={methods} setMethods={setMethods} />
              <MethodCheckbox label="Jacobi" value="jacobi" methods={methods} setMethods={setMethods} />
              <MethodCheckbox label="Gauss-Seidel" value="gauss_seidel" methods={methods} setMethods={setMethods} />
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
              <h3 className="font-semibold text-slate-950 dark:text-white">Residual Error by Iteration</h3>
              <ChartZoomControl label="Zoom" value={residualZoom} onChange={setResidualZoom} />
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={residualData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="k" type="number" domain={residualDomain} />
                <YAxis />
                <Tooltip />
                {results
                  .filter((result) => result.history.length > 0)
                  .map((result, index) => (
                    <Line key={result.method} type="monotone" dataKey={result.method} stroke={colors[index % colors.length]} dot={false} strokeWidth={2} />
                  ))}
              </LineChart>
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

function generateRandomSystem(size: number) {
  const matrix = Array.from({ length: size }, () => Array.from({ length: size }, () => randomInt(-5, 5)))
  const trueSolution = Array.from({ length: size }, () => randomInt(-3, 3) || 1)

  for (let i = 0; i < size; i += 1) {
    const rowSum = matrix[i].reduce((sum, value, index) => (index === i ? sum : sum + Math.abs(value)), 0)
    matrix[i][i] = rowSum + randomInt(5, 12)
  }

  const vector = matrix.map((row) => row.reduce((sum, value, index) => sum + value * trueSolution[index], 0))
  return { matrix, vector }
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
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

function buildResidualData(results: AlgorithmResult[]) {
  const rows = new Map<number, Record<string, number | null>>()
  for (const result of results) {
    for (const item of result.history) {
      const k = Number(item.k)
      const residual = typeof item.residual === 'number' ? item.residual : null
      rows.set(k, { ...(rows.get(k) ?? { k }), [result.method]: residual })
    }
  }
  return [...rows.values()].sort((left, right) => Number(left.k) - Number(right.k))
}
