function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') && part.length > 4
          ? <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </>
  )
}

export function FormattedText({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/)
  return (
    <div className="flex flex-col gap-2.5">
      {paragraphs.map((block, i) => {
        const lines = block.split('\n')
        const isList = lines.every(l => /^[\-\*•]\s/.test(l.trim()) || l.trim() === '')
        if (isList && lines.some(l => l.trim())) {
          return (
            <ul key={i} className="flex flex-col gap-1 pl-0 m-0 list-none">
              {lines.filter(l => l.trim()).map((l, j) => (
                <li key={j} className="flex gap-2 items-start">
                  <span className="text-primary mt-[3px] shrink-0 text-[10px]">●</span>
                  <span className="font-sans text-[13px] leading-[1.6] text-foreground">
                    <InlineText text={l.replace(/^[\-\*•]\s+/, '')} />
                  </span>
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="font-sans text-[13px] leading-[1.65] text-foreground m-0">
            <InlineText text={block} />
          </p>
        )
      })}
    </div>
  )
}
