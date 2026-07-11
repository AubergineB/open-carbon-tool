export default function SaveIndicator({ status }) {
  if (status === 'idle') return null

  const config = {
    saving: { color: 'bg-accent-warm', text: 'Sauvegarde...', animate: true },
    saved: { color: 'bg-primary', text: 'Sauvegardé', animate: false },
    error: { color: 'bg-error', text: 'Erreur', animate: false },
  }

  const { color, text, animate } = config[status] || config.saved

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 ${color} ${animate ? 'animate-pulse' : ''}`} />
      <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{text}</span>
    </div>
  )
}
