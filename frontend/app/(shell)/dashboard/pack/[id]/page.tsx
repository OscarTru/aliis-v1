import { redirect } from 'next/navigation'

export default function DashboardPackPage({ params }: { params: Promise<{ id: string }> }) {
  redirect('/historial')
}
