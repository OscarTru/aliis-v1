export function ScribbleBrain({ size = 90 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden style={{ display: 'block' }}>
      <g stroke="var(--c-brand-scribble)" fill="none" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28,60 C18,50 18,32 34,26 C40,16 58,14 66,24 C78,18 94,28 92,42 C100,50 98,66 86,72 C86,86 70,94 58,86 C46,94 30,86 30,74 C22,70 22,62 28,60 Z" />
        <path d="M40,42 C48,38 56,44 60,50" opacity=".7" />
        <path d="M66,56 C74,54 80,60 78,66" opacity=".7" />
        <path d="M46,66 C52,70 58,68 62,72" opacity=".6" />
        <path d="M54,30 C58,36 56,44 62,48" opacity=".5" />
        <circle cx="58" cy="58" r="1.8" fill="var(--c-brand-scribble)" stroke="none" opacity=".7" />
        <circle cx="72" cy="48" r="1.2" fill="var(--c-brand-scribble)" stroke="none" opacity=".6" />
        <circle cx="42" cy="56" r="1" fill="var(--c-brand-scribble)" stroke="none" opacity=".5" />
      </g>
    </svg>
  )
}
