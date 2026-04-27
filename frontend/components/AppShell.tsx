import { Sidebar } from '@/components/Sidebar'
import { PackProvider } from '@/lib/pack-context'
import { ConditionProvider } from '@/lib/condition-context'
import { PageWrapper } from '@/components/PageWrapper'
import { NotificationBell } from '@/components/NotificationBell'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PackProvider>
      <ConditionProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top bar */}
            <div className="shrink-0 flex items-center justify-end px-6 py-3 border-b border-border bg-background/80 backdrop-blur-xl">
              <NotificationBell />
            </div>
            <main className="flex-1 overflow-y-auto">
              <PageWrapper>
                {children}
              </PageWrapper>
            </main>
          </div>
        </div>
      </ConditionProvider>
    </PackProvider>
  )
}
