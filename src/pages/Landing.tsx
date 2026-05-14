import { motion } from 'framer-motion'
import { ArrowRight, LineChart, Network, Sigma } from 'lucide-react'
import type { PageId } from '../pyodide/types'

type LandingProps = {
  setPage: (page: PageId) => void
}

const modules = [
  {
    id: 'root' as const,
    title: 'Root Finding',
    icon: Sigma,
    description: 'Compare Bisection, Newton, and Fixed-Point iteration for f(x) = 0.',
    accent: 'from-indigo-500 to-violet-500',
  },
  {
    id: 'linear' as const,
    title: 'Linear Systems',
    icon: Network,
    description: 'Solve Ax = b with Gaussian Elimination, Jacobi, and Gauss-Seidel.',
    accent: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'approximation' as const,
    title: 'Approximation & Interpolation',
    icon: LineChart,
    description: 'Fit data with interpolation, least squares, and linear regression.',
    accent: 'from-emerald-500 to-teal-500',
  },
]

export function Landing({ setPage }: LandingProps) {
  return (
    <div className="space-y-6">
      <section className="glass-card overflow-hidden rounded-[2rem] p-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">
            Final project
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 dark:text-white md:text-6xl">
            Numerical Algorithms Test Suite
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
            A browser-based tool for testing course algorithms on the same input, then comparing accuracy,
            convergence, iterations, runtime, reliability, and useful failure cases.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {modules.map((module, index) => {
          const Icon = module.icon
          return (
            <motion.article
              key={module.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07, duration: 0.24 }}
              className="glass-card group rounded-[2rem] p-6 transition hover:-translate-y-1"
            >
              <div className={`inline-flex rounded-3xl bg-gradient-to-br ${module.accent} p-4 text-white shadow-lg`}>
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-slate-950 dark:text-white">{module.title}</h3>
              <p className="mt-3 min-h-20 text-sm leading-6 text-slate-500 dark:text-slate-400">{module.description}</p>
              <button
                type="button"
                onClick={() => setPage(module.id)}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition group-hover:gap-3 dark:bg-white dark:text-slate-950"
              >
                Open module
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.article>
          )
        })}
      </section>
    </div>
  )
}
