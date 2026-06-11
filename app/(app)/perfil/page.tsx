'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileView } from '@/components/views/profile-view'
import { useUser } from '@/components/auth/user-provider'
import { routes } from '@/lib/routes'

export default function ProfilePage() {
  const router = useRouter()
  const { isSponsor, loading } = useUser()

  useEffect(() => {
    if (!loading && isSponsor) {
      router.replace(routes.prizes)
    }
  }, [isSponsor, loading, router])

  if (loading || isSponsor) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Cargando…
      </div>
    )
  }

  return <ProfileView />
}
