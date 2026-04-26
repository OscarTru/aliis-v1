import { redirect } from 'next/navigation'

export default async function DashboardPackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/pack/${id}`)
}
