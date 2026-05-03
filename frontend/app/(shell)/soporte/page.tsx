import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { PageHeader } from '@/components/PageHeader'
import { SupportSection } from '@/components/SupportSection'

export const metadata = {
  title: 'Soporte · Aliis',
}

export default async function SoportePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: p } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle()

  const plan: 'free' | 'pro' = p?.plan === 'pro' ? 'pro' : 'free'

  return (
    <div className="max-w-[680px] mx-auto px-4 md:px-8 pt-8 md:pt-10 pb-28 md:pb-20">
      <PageHeader
        eyebrow="Cómo te ayudamos"
        title={<>Cuéntanos qué <em>necesitas</em>.</>}
        subtitle="Responde el equipo de Aliis. Soporte cubre temas de cuenta, suscripción y problemas técnicos."
      />

      <SupportSection plan={plan} />
    </div>
  )
}
