import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getTreatments } from '@/app/actions/treatments'
import { TratamientosClient } from './TratamientosClient'
import type { AdherenceLog } from '@/lib/types'

export default async function TratamientosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Intl.DateTimeFormat('en-CA').format(new Date())

  const [treatments, adherenceResult] = await Promise.all([
    getTreatments(),
    supabase
      .from('adherence_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('taken_date', today),
  ])

  const todayLogs: AdherenceLog[] = (adherenceResult.data ?? []) as AdherenceLog[]

  return (
    <div className="px-4 md:px-8 pt-8 md:pt-10 pb-28 md:pb-20 max-w-[680px] mx-auto">
      <div className="mb-8">
        <p className="font-mono text-[10px] tracking-[.18em] uppercase text-muted-foreground/50 mb-1">
          Mis tratamientos
        </p>
        <h1 className="font-serif text-[28px] leading-[1.2] text-foreground m-0">
          Tu <em>farmacia</em> personal
        </h1>
      </div>
      <TratamientosClient
        initialTreatments={treatments}
        initialTodayLogs={todayLogs}
        todayDate={today}
      />
    </div>
  )
}
