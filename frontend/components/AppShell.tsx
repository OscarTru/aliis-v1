import { Sidebar } from '@/components/Sidebar'
import { BottomNav } from '@/components/BottomNav'
import { PackProvider } from '@/lib/pack-context'
import { ConditionProvider } from '@/lib/condition-context'
import { PageWrapper } from '@/components/PageWrapper'
import { NotificationBell } from '@/components/NotificationBell'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initialName: string | null = null
  let initialEmail: string | null = user?.email ?? null
  let initialPlan: string = 'free'
  let initialInitial: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name,plan')
      .eq('id', user.id)
      .single()
    initialName = profile?.name ?? null
    initialPlan = profile?.plan ?? 'free'
    initialInitial = (initialName?.[0] ?? initialEmail?.[0] ?? '?').toUpperCase()
  }

  return (
    <PackProvider>
      <ConditionProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar
            initialName={initialName}
            initialEmail={initialEmail}
            initialPlan={initialPlan}
            initialInitial={initialInitial}
          />
          <main className="flex-1 overflow-y-auto relative">
            <div className="fixed top-4 right-4 z-50">
              <NotificationBell />
            </div>
            <PageWrapper>
              {children}
            </PageWrapper>
          </main>
        </div>
        <BottomNav />
      </ConditionProvider>
    </PackProvider>
  )
}
