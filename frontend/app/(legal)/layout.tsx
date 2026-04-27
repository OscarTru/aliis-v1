import { AppNav } from '@/components/AppNav'
import { Footer } from '@/components/Footer'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
