// Standalone group — no sidebar, no bottom nav.
// Just the page content with a clean background.
export default function StandaloneLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
