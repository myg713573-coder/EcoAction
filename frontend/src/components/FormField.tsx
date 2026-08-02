type FormFieldProps = {
  label: string
  type?: string
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function FormField({ label, type = 'text', name, value, onChange, placeholder }: FormFieldProps) {
  return (
    <label className="block space-y-2 text-sm text-slate-300">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
      />
    </label>
  )
}
