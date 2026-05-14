import katex from 'katex'

type MathInputProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  helper?: string
}

export function MathInput({ label, value, onChange, placeholder, helper }: MathInputProps) {
  const latex = value
    .replaceAll('**', '^')
    .replaceAll('*', '\\cdot ')
    .replaceAll('sqrt', '\\sqrt')

  const preview = (() => {
    try {
      return katex.renderToString(latex || ' ', { throwOnError: false })
    } catch {
      return value
    }
  })()

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <input
        className="input mt-2 font-mono"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      {helper && <span className="mt-2 block text-xs text-slate-500 dark:text-slate-400">{helper}</span>}
      <div
        className="mt-3 rounded-2xl bg-slate-100/80 px-4 py-3 text-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
        dangerouslySetInnerHTML={{ __html: preview }}
      />
    </label>
  )
}
