export function Spinner({ label = 'Working...' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      {label}
    </span>
  )
}
