type PyodideInstance = {
  runPython: (code: string) => unknown
  loadPackage: (name: string) => Promise<void>
  globals: {
    set: (name: string, value: unknown) => void
    delete: (name: string) => void
  }
}

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideInstance>
  }
}

let pyodidePromise: Promise<PyodideInstance> | null = null

const PYODIDE_VERSION = '0.27.7'
const PY_FILES = [
  '/py/common.py',
  '/py/root_finding.py',
  '/py/linear_systems.py',
  '/py/approximation.py',
]

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Could not load ${src}`))
    document.head.appendChild(script)
  })
}

async function loadPyFiles(pyodide: PyodideInstance) {
  for (const file of PY_FILES) {
    const response = await fetch(file)
    if (!response.ok) {
      throw new Error(`Could not load ${file}`)
    }
    pyodide.runPython(await response.text())
  }
}

export async function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      const indexURL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`
      await loadScript(`${indexURL}pyodide.js`)

      if (!window.loadPyodide) {
        throw new Error('Pyodide loader was not available.')
      }

      const pyodide = await window.loadPyodide({ indexURL })
      await pyodide.loadPackage('numpy')
      pyodide.runPython('import json')
      await loadPyFiles(pyodide)
      return pyodide
    })()
  }

  return pyodidePromise
}

export async function callPy<T>(
  _moduleName: string,
  functionName: string,
  args: Record<string, unknown>,
): Promise<T> {
  const pyodide = await getPyodide()
  pyodide.globals.set('__js_args_json', JSON.stringify(args))

  try {
    const pyResult = pyodide.runPython(`${functionName}(json.loads(__js_args_json))`)
    const maybeProxy = pyResult as { toJs?: (options?: unknown) => T; destroy?: () => void }
    const result = maybeProxy.toJs
      ? maybeProxy.toJs({ dict_converter: Object.fromEntries })
      : (pyResult as T)
    maybeProxy.destroy?.()
    return result
  } finally {
    pyodide.globals.delete('__js_args_json')
  }
}
