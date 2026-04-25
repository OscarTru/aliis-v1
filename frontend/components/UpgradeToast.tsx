'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export function UpgradeToast() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (searchParams.get('upgraded') === '1') {
      toast({
        title: '¡Bienvenido a Pro!',
        description: 'Tu cuenta ya está activa. Empieza a crear explicaciones ilimitadas.',
        duration: 5000,
      })
      router.replace('/historial')
    }
  }, [searchParams, router, toast])

  return null
}
