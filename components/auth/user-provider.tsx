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
import { withTimeout } from '@/lib/async'
import { createClient } from '@/lib/supabase/client'
import { getAvatarUrl, getDisplayName, getHandle } from '@/lib/auth/user'
import { type Player, type PlayerProfileData } from '@/lib/data'
import type { AccountType, ProfileRow } from '@/lib/types/account'
import {
  emptyProfile,
  fetchProfile,
  fetchProfileViaApi,
  formatProfileSaveError,
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
  isAdmin: boolean
  country: CountryId
  province: string
  loading: boolean
  signOut: () => Promise<void>
  updateProfile: (input: ProfileSaveInput) => Promise<string | null>
  refreshProfile: () => Promise<ProfileRow | null>
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
    wins: 0,
    losses: 0,
    streak: 0,
    rating: 0,
    region: province,
    status: 'online',
  }
}

function applyProfileState(
  row: ProfileRow,
  currentUser: User,
  setProfileRow: (row: ProfileRow) => void,
  setProfile: (profile: PlayerProfileData) => void,
) {
  setProfileRow(row)
  setProfile(profileRowToPlayerData(row, currentUser))
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileRow, setProfileRow] = useState<ProfileRow | null>(null)
  const [profile, setProfile] = useState<PlayerProfileData>(emptyProfile)

  const loadProfile = useCallback(async (currentUser: User) => {
    const supabase = createClient()

    try {
      let row = await fetchProfile(supabase, currentUser.id)
      if (!row) {
        try {
          row = await fetchProfileViaApi()
        } catch {
          setProfileRow(null)
          setProfile(profileFromGoogle(currentUser))
          return null
        }
      }
      applyProfileState(row, currentUser, setProfileRow, setProfile)
      return row
    } catch {
      try {
        const row = await fetchProfileViaApi()
        applyProfileState(row, currentUser, setProfileRow, setProfile)
        return row
      } catch {
        setProfileRow(null)
        setProfile(profileFromGoogle(currentUser))
        return null
      }
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let active = true

    function handleMissingProfile(currentUser: User) {
      if (!active) return
      setProfileRow(null)
      setProfile(profileFromGoogle(currentUser))
    }

    function hydrateProfile(currentUser: User) {
      void loadProfile(currentUser).catch(() => handleMissingProfile(currentUser))
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) hydrateProfile(currentUser)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return

      const nextUser = session?.user ?? null
      setUser(nextUser)

      if (!nextUser) {
        setProfileRow(null)
        setProfile(emptyProfile)
        setLoading(false)
        return
      }

      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        hydrateProfile(nextUser)
      }

      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const accountType: AccountType = profileRow?.account_type ?? 'jugador'
  const isSponsor = accountType === 'sponsor'
  const isAdmin = profileRow?.is_admin ?? false
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

    if (!next.firstName.trim()) return 'El nombre es obligatorio.'
    if (!next.lastName.trim()) return 'El apellido es obligatorio.'
    if (!next.displayName.trim()) {
      return isSponsor
        ? 'El nombre visible es obligatorio.'
        : 'El nombre para mostrar es obligatorio.'
    }
    if (!isSponsor) {
      if (!next.dni.trim()) return 'El DNI es obligatorio.'
      if (!/^\d{7,8}$/.test(next.dni)) {
        return 'El DNI debe tener 7 u 8 dígitos.'
      }
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
      await withTimeout(
        (async () => {
          const supabase = createClient()
          if (!isSponsor) {
            const taken = await isDniTaken(supabase, next.dni.trim(), user.id)
            if (taken) {
              throw new Error('Ese DNI ya está registrado por otro jugador.')
            }
          }

          let row = profileRow
          if (!row) {
            try {
              row = await fetchProfile(supabase, user.id)
            } catch {
              row = await fetchProfileViaApi()
            }
          }
          if (!row) {
            throw new Error('Completá el registro antes de guardar tu perfil.')
          }

          let avatarUrl = row.avatar_url ?? getAvatarUrl(user) ?? null
          if (input.avatarFile) {
            avatarUrl = await uploadAvatar(supabase, user.id, input.avatarFile)
          } else if (next.avatar.startsWith('http')) {
            avatarUrl = next.avatar
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

          applyProfileState(updated, user, setProfileRow, setProfile)
        })(),
        25_000,
        'El guardado tardó demasiado. Revisá tu conexión e intentá de nuevo.',
      )
      return null
    } catch (err) {
      return formatProfileSaveError(err)
    }
  }

  async function refreshProfile() {
    if (!user) return null
    try {
      return await loadProfile(user)
    } catch {
      setProfile(profileFromGoogle(user))
      return null
    }
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
        isAdmin,
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
