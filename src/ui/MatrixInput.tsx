type MatrixInputProps = {
  matrix: number[][]
  vector: number[]
  onMatrixChange: (matrix: number[][]) => void
  onVectorChange: (vector: number[]) => void
}

export function MatrixInput({ matrix, vector, onMatrixChange, onVectorChange }: MatrixInputProps) {
  const visibleSize = matrix.length > 10 ? 8 : matrix.length
  const visibleMatrix = matrix.slice(0, visibleSize).map((row) => row.slice(0, visibleSize))
  const visibleVector = vector.slice(0, visibleSize)

  function updateMatrix(row: number, col: number, value: string) {
    const next = matrix.map((items) => [...items])
    next[row][col] = Number(value)
    onMatrixChange(next)
  }

  function updateVector(index: number, value: string) {
    const next = [...vector]
    next[index] = Number(value)
    onVectorChange(next)
  }

  return (
    <div>
      {matrix.length > visibleSize && (
        <div className="mb-4 rounded-2xl bg-indigo-500/10 p-4 text-sm text-indigo-700 dark:text-indigo-200">
          Showing a {visibleSize}x{visibleSize} preview of a {matrix.length}x{matrix.length} generated system. The full matrix is still used when running the algorithms.
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Matrix A</h3>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${visibleSize}, minmax(0, 1fr))` }}>
            {visibleMatrix.map((row, rowIndex) =>
              row.map((value, colIndex) => (
                <input
                  key={`${rowIndex}-${colIndex}`}
                  className="input text-center"
                  type="number"
                  value={value}
                  onChange={(event) => updateMatrix(rowIndex, colIndex, event.target.value)}
                />
              )),
            )}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Vector b</h3>
          <div className="grid gap-2">
            {visibleVector.map((value, index) => (
              <input
                key={index}
                className="input text-center"
                type="number"
                value={value}
                onChange={(event) => updateVector(index, event.target.value)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
