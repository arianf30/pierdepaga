'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { getAvatarUrl, getDisplayName, getHandle } from '@/lib/auth/user'
import { type Player, type PlayerProfileData } from '@/lib/data'
import type { AccountType, ProfileRow } from '@/lib/types/account'
import {
  emptyProfile,
  ensureProfile,
  fetchProfile,
  isDniTaken,
  playerDataToProfileUpdate,
  profileFromGoogle,
  profileRowToPlayerData,
  updateProfileRow,
  uploadAvatar,
} from '@/lib/supabase/profiles'
import { isCountryId, type CountryId } from '@/lib/catalog'

type ProfileSaveInput = {
  profile: PlayerProfileData
  country: string
  province: string
  avatarFile?: File | null
}

type UserContextValue = {
  user: User | null
  player: Player
  profile: PlayerProfileData
  profileRow: ProfileRow | null
  accountType: AccountType
  isSponsor: boolean
  country: CountryId
  province: string
  loading: boolean
  signOut: () => Promise<void>
  updateProfile: (input: ProfileSaveInput) => Promise<string | null>
  refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

function buildPlayer(
  user: User | null,
  profile: PlayerProfileData,
  province: string,
): Player {
  const fullName = `${profile.firstName} ${profile.lastName}`.trim()
  const publicName =
    profile.displayName.trim() || fullName || (user ? getDisplayName(user) : '')

  if (!user) {
    return {
      id: 'guest',
      name: publicName || 'Jugador',
      displayName: publicName,
      handle: '@jugador',
      avatar: profile.avatar || '/placeholder-user.jpg',
      rank: 0,
      rankDelta: 0,
      tier: '—',
      wins: 0,
      losses: 0,
      streak: 0,
      rating: 0,
      region: province,
      status: 'offline',
    }
  }

  return {
    id: user.id,
    name: fullName || getDisplayName(user),
    displayName: publicName,
    handle: getHandle(user),
    avatar: profile.avatar || getAvatarUrl(user) || '/placeholder-user.jpg',
    rank: 0,
    rankDelta: 0,
    tier: '—',
    wins: profile.setsWon,
    losses: profile.setsLost,
    streak: 0,
    rating: 0,
    region: province,
    status: 'online',
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileRow, setProfileRow] = useState<ProfileRow | null>(null)
  const [profile, setProfile] = useState<PlayerProfileData>(emptyProfile)

  const loadProfile = useCallback(async (currentUser: User) => {
    const supabase = createClient()
    let row = await fetchProfile(supabase, currentUser.id)

    if (!row) {
      row = await ensureProfile(supabase, currentUser, 'jugador')
    }

    setProfileRow(row)
    setProfile(profileRowToPlayerData(row, currentUser))
  }, [])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user: current } }) => {
      setUser(current)
      if (current) {
        try {
          await loadProfile(current)
        } catch {
          setProfileRow(null)
          setProfile(profileFromGoogle(current))
        }
      }
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null
      setUser(nextUser)
      if (nextUser) {
        try {
          await loadProfile(nextUser)
        } catch {
          setProfileRow(null)
          setProfile(profileFromGoogle(nextUser))
        }
      } else {
        setProfileRow(null)
        setProfile(emptyProfile)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [loadProfile])

  const accountType: AccountType = profileRow?.account_type ?? 'jugador'
  const isSponsor = accountType === 'sponsor'
  const country = (profileRow?.country_id && isCountryId(profileRow.country_id)
    ? profileRow.country_id
    : 'ar') as CountryId
  const province = profileRow?.province ?? 'Formosa'

  const player = useMemo<Player>(
    () => buildPlayer(user, profile, province),
    [user, profile, province],
  )

  async function updateProfile(
    input: ProfileSaveInput,
  ): Promise<string | null> {
    const next = input.profile

    if (!next.displayName.trim()) {
      return 'El nombre para mostrar es obligatorio.'
    }
    if (!next.dni.trim()) return 'El DNI es obligatorio.'
    if (!/^\d{7,8}$/.test(next.dni)) {
      return 'El DNI debe tener 7 u 8 dígitos.'
    }
    if (!isCountryId(input.country)) return 'País no disponible.'

    if (!user) {
      setProfile({
        ...next,
        displayName: next.displayName.trim(),
      })
      return null
    }

    try {
      const supabase = createClient()
      const taken = await isDniTaken(supabase, next.dni.trim(), user.id)
      if (taken) return 'Ese DNI ya está registrado por otro jugador.'

      let row = profileRow
      if (!row) {
        row = await ensureProfile(supabase, user, accountType)
      }

      let avatarUrl = row.avatar_url
      if (input.avatarFile) {
        avatarUrl = await uploadAvatar(supabase, user.id, input.avatarFile)
      } else if (
        next.avatar.startsWith('http') ||
        (next.avatar.startsWith('/') && next.avatar !== '/placeholder-user.jpg')
      ) {
        avatarUrl = next.avatar.startsWith('http') ? next.avatar : row.avatar_url
      }

      const updated = await updateProfileRow(
        supabase,
        user.id,
        playerDataToProfileUpdate(
          { ...next, displayName: next.displayName.trim() },
          input.country,
          input.province,
          avatarUrl,
        ),
      )

      setProfileRow(updated)
      setProfile(profileRowToPlayerData(updated, user))
      return null
    } catch (err) {
      return err instanceof Error
        ? err.message
        : 'No se pudo guardar el perfil.'
    }
  }

  async function refreshProfile() {
    if (!user) return
    await loadProfile(user)
  }

  async function signOut() {
    window.location.assign('/auth/signout')
  }

  return (
    <UserContext.Provider
      value={{
        user,
        player,
        profile,
        profileRow,
        accountType,
        isSponsor,
        country,
        province,
        loading,
        signOut,
        updateProfile,
        refreshProfile,
      }}
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
