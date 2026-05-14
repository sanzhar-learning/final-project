import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getPyodide } from './pyodide/runner'
import type { PageId, PyodideStatus } from './pyodide/types'
import { Layout } from './ui/Layout'
import { Approximation } from './pages/Approximation'
import { Landing } from './pages/Landing'
import { LinearSystems } from './pages/LinearSystems'
import { RootFinding } from './pages/RootFinding'

function App() {
  const [page, setPage] = useState<PageId>('landing')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light')
  const [pyodideStatus, setPyodideStatus] = useState<PyodideStatus>('loading')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  useEffect(() => {
    getPyodide()
      .then(() => setPyodideStatus('ready'))
      .catch((error) => {
        console.error(error)
        setPyodideStatus('error')
      })
  }, [])

  const content = {
    landing: <Landing setPage={setPage} />,
    root: <RootFinding pyodideStatus={pyodideStatus} />,
    linear: <LinearSystems pyodideStatus={pyodideStatus} />,
    approximation: <Approximation pyodideStatus={pyodideStatus} />,
  }[page]

  return (
    <Layout
      page={page}
      setPage={setPage}
      darkMode={darkMode}
      toggleDarkMode={() => setDarkMode((value) => !value)}
      pyodideStatus={pyodideStatus}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </Layout>
  )
}

export default App
