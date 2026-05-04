import { Sidebar } from '@/components/Sidebar'
import { BottomNav } from '@/components/BottomNav'
import { PackProvider } from '@/lib/pack-context'
import { ConditionProvider } from '@/lib/condition-context'
import { PageWrapper } from '@/components/PageWrapper'
import { NotificationBellWrapper } from '@/components/NotificationBellWrapper'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AliisAgentIsland } from '@/components/AliisAgentIsland'
import { MainArea } from '@/components/MainArea'

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
    <AliisAgentIsland>
      <PackProvider>
        <ConditionProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar
              initialName={initialName}
              initialEmail={initialEmail}
              initialPlan={initialPlan}
              initialInitial={initialInitial}
            />
            <MainArea>
              <NotificationBellWrapper />
              <PageWrapper>
                {children}
              </PageWrapper>
            </MainArea>
          </div>
          <BottomNav />
        </ConditionProvider>
      </PackProvider>
    </AliisAgentIsland>
  )
}
