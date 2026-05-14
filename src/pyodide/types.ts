export type PageId = 'landing' | 'root' | 'linear' | 'approximation'

export type AlgorithmResult = {
  method: string
  result: number | number[] | string | null
  error: number | null
  residual: number | null
  iterations: number | null
  runtime_ms: number
  converged: boolean
  failure_reason: string | null
  history: Array<Record<string, number | string | null>>
  notes: string
}

export type RootFindingResponse = {
  results: AlgorithmResult[]
  function_points: Array<{ x: number; y: number | null }>
}

export type ApproximationPoint = {
  x: number
  y: number
}

export type PyodideStatus = 'loading' | 'ready' | 'error'
