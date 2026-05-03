// Override the (shell) AppShell for the pricing page — no sidebar, no bottom nav.
export default function PreciosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
