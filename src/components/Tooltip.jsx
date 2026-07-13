import { useState } from 'react'

export default function Tooltip({ label, children }) {
  const [open, setOpen] = useState(false)
  return (
    <span
      className="relative inline-flex align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button type="button" aria-label={label} className="material-symbols-outlined text-sm text-outline cursor-help">info</button>
      {open && (
        <span role="tooltip" className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 z-50 bg-primary text-on-primary p-4 shadow-lg normal-case tracking-normal text-left">
          <span className="block text-[10px] font-bold uppercase tracking-widest mb-2">{label}</span>
          <span className="block text-xs leading-relaxed font-normal">{children}</span>
        </span>
      )}
    </span>
  )
}
