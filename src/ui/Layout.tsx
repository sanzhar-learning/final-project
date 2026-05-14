import { motion } from 'framer-motion'
import { BarChart3, Home, LineChart, Moon, Network, Sigma, Sun } from 'lucide-react'
import type { ElementType, ReactNode } from 'react'
import type { PageId, PyodideStatus } from '../pyodide/types'

type LayoutProps = {
  page: PageId
  setPage: (page: PageId) => void
  darkMode: boolean
  toggleDarkMode: () => void
  pyodideStatus: PyodideStatus
  children: ReactNode
}

const navItems: Array<{ id: PageId; label: string; icon: ElementType }> = [
  { id: 'landing', label: 'Dashboard', icon: Home },
  { id: 'root', label: 'Root Finding', icon: Sigma },
  { id: 'linear', label: 'Linear Systems', icon: Network },
  { id: 'approximation', label: 'Approximation', icon: LineChart },
]

export function Layout({ page, setPage, darkMode, toggleDarkMode, pyodideStatus, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_32%),linear-gradient(135deg,_#f8fafc,_#edf2ff)] text-slate-700 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_32%),linear-gradient(135deg,_#020617,_#111827)] dark:text-slate-300">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-5 px-4 py-5 lg:flex-row">
        <aside className="glass-card rounded-[2rem] p-4 lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:w-72">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-lg shadow-indigo-600/25">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Numerical</p>
              <h1 className="text-xl font-bold text-slate-950 dark:text-white">Algorithms Test Suite</h1>
            </div>
          </div>

          <nav className="mt-6 grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = item.id === page
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPage(item.id)}
                  className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    active
                      ? 'text-white'
                      : 'text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-800/80'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/25"
                    />
                  )}
                  <Icon className="relative h-5 w-5" />
                  <span className="relative">{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-6 rounded-3xl bg-slate-100/70 p-4 text-sm dark:bg-slate-900/70">
            <p className="font-semibold text-slate-950 dark:text-white">Python runtime</p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              {pyodideStatus === 'ready' && 'Ready. Algorithms run in your browser.'}
              {pyodideStatus === 'loading' && 'Loading Pyodide and NumPy...'}
              {pyodideStatus === 'error' && 'Could not load Pyodide.'}
            </p>
          </div>
        </aside>

        <main className="flex-1">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Interactive dashboard</p>
              <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Compare numerical methods clearly</h2>
            </div>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="glass-card inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 dark:text-slate-200"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {darkMode ? 'Light' : 'Dark'} mode
            </button>
          </header>
          {children}
        </main>
      </div>
    </div>
  )
}
