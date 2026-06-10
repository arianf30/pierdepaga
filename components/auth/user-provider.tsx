'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { getAvatarUrl, getDisplayName, getHandle } from '@/lib/auth/user'
import {
  defaultProfile,
  me as baseMe,
  takenDnis,
  type Player,
  type PlayerProfileData,
} from '@/lib/data'

type UserContextValue = {
  user: User | null
  player: Player
  profile: PlayerProfileData
  loading: boolean
  signOut: () => Promise<void>
  updateProfile: (next: PlayerProfileData) => string | null
}

const UserContext = createContext<UserContextValue | null>(null)

function splitName(fullName: string): Pick<PlayerProfileData, 'firstName' | 'lastName'> {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: 'Jugador', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<PlayerProfileData>(defaultProfile)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user: current } }) => {
      setUser(current)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    const avatar = getAvatarUrl(user)
    const { firstName, lastName } = splitName(getDisplayName(user))
    setProfile((prev) => ({
      ...prev,
      firstName,
      lastName,
      avatar: avatar ?? prev.avatar,
    }))
  }, [user])

  const player = useMemo<Player>(() => {
    const fullName = `${profile.firstName} ${profile.lastName}`.trim()

    if (!user) {
      return {
        ...baseMe,
        name: fullName || baseMe.name,
        avatar: profile.avatar || baseMe.avatar,
      }
    }

    return {
      ...baseMe,
      name: fullName || getDisplayName(user),
      handle: getHandle(user),
      avatar: profile.avatar || getAvatarUrl(user) || baseMe.avatar,
    }
  }, [user, profile])

  function updateProfile(next: PlayerProfileData): string | null {
    if (!next.dni.trim()) return 'El DNI es obligatorio.'
    if (!/^\d{7,8}$/.test(next.dni)) return 'El DNI debe tener 7 u 8 dígitos.'
    if (takenDnis.has(next.dni) && next.dni !== profile.dni) {
      return 'Ese DNI ya está registrado por otro jugador.'
    }

    setProfile(next)
    return null
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <UserContext.Provider
      value={{ user, player, profile, loading, signOut, updateProfile }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser debe usarse dentro de UserProvider')
  return ctx
}
