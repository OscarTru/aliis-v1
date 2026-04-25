import { Sidebar } from '@/components/Sidebar'
import { PackProvider } from '@/lib/pack-context'
import { ConditionProvider } from '@/lib/condition-context'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PackProvider>
      <ConditionProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </ConditionProvider>
    </PackProvider>
  )
}
