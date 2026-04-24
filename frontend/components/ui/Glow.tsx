export function Glow() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '70%',
          aspectRatio: '1/1',
          borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(31,138,155,0.06),transparent 62%)',
          animation: 'ce-breathe 8s ease-in-out infinite',
        }}
      />
    </div>
  )
}
