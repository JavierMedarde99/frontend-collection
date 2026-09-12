export interface SortOption {
  value: string
  label: string
}

interface SortSelectProps {
  value: string
  onChange: (value: string) => void
  options: SortOption[]
}

export default function SortSelect({ value, onChange, options }: SortSelectProps) {
  return (
    <select
      className="input md:w-56"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Ordenar por"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
