import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NotificationBellClient } from '@/components/NotificationBellClient'

export async function NotificationBellWrapper() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initialUnread = 0
  if (user) {
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)
    initialUnread = count ?? 0
  }

  return <NotificationBellClient initialUnread={initialUnread} />
}
