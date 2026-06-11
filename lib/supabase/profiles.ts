import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { PlayerProfileData } from '@/lib/data'
import type {
  AccountType,
  ProfileRow,
  ProfileUpdateInput,
  SponsorPrizeSubmission,
} from '@/lib/types/account'
import { getAvatarUrl, getDisplayName } from '@/lib/auth/user'
import { DEFAULT_COUNTRY_ID, defaultProvinceFor } from '@/lib/catalog'

export function splitGoogleName(user: User): {
  firstName: string
  lastName: string
} {
  const full = getDisplayName(user).trim()
  const parts = full.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: 'Jugador', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

export const emptyProfile: PlayerProfileData = {
  firstName: '',
  lastName: '',
  displayName: '',
  dni: '',
  avatar: '/placeholder-user.jpg',
  setsWon: 0,
  setsLost: 0,
  gamesWon: 0,
  gamesLost: 0,
}

export function profileFromGoogle(user: User): PlayerProfileData {
  const { firstName, lastName } = splitGoogleName(user)
  const fullName = `${firstName} ${lastName}`.trim()

  return {
    firstName,
    lastName,
    displayName: firstName || fullName || getDisplayName(user),
    dni: '',
    avatar: getAvatarUrl(user) ?? '/placeholder-user.jpg',
    setsWon: 0,
    setsLost: 0,
    gamesWon: 0,
    gamesLost: 0,
  }
}

export function profileRowToPlayerData(
  row: ProfileRow,
  user?: User,
): PlayerProfileData {
  const google = user ? profileFromGoogle(user) : null
  const firstName = row.first_name?.trim() || google?.firstName || ''
  const lastName = row.last_name?.trim() || google?.lastName || ''
  const displayName =
    row.display_name?.trim() || firstName || google?.displayName || ''

  return {
    firstName,
    lastName,
    displayName,
    instagram: row.instagram?.trim() || undefined,
    dni: row.dni?.trim() ?? '',
    avatar: row.avatar_url || google?.avatar || '/placeholder-user.jpg',
    setsWon: row.sets_won,
    setsLost: row.sets_lost,
    gamesWon: row.games_won,
    gamesLost: row.games_lost,
  }
}

export function playerDataToProfileUpdate(
  data: PlayerProfileData,
  countryId: string,
  province: string,
  avatarUrl: string | null,
): ProfileUpdateInput {
  return {
    first_name: data.firstName.trim(),
    last_name: data.lastName.trim(),
    display_name: data.displayName.trim(),
    dni: data.dni.trim() || null,
    instagram: data.instagram?.trim() || null,
    avatar_url: avatarUrl,
    country_id: countryId,
    province,
    sets_won: data.setsWon,
    sets_lost: data.setsLost,
    games_won: data.gamesWon,
    games_lost: data.gamesLost,
  }
}

export async function fetchProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data as ProfileRow | null
}

export async function ensureProfile(
  supabase: SupabaseClient,
  user: User,
  accountType: AccountType,
): Promise<ProfileRow> {
  const existing = await fetchProfile(supabase, user.id)
  if (existing) return existing

  const { firstName, lastName } = splitGoogleName(user)
  const googleAvatar = getAvatarUrl(user) ?? null

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      account_type: accountType,
      first_name: firstName,
      last_name: lastName,
      display_name: firstName,
      avatar_url: googleAvatar,
      country_id: DEFAULT_COUNTRY_ID,
      province: defaultProvinceFor(DEFAULT_COUNTRY_ID),
    })
    .select('*')
    .single()

  if (error) throw error
  return data as ProfileRow
}

export async function updateProfileRow(
  supabase: SupabaseClient,
  userId: string,
  input: ProfileUpdateInput,
): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from('profiles')
    .update(input)
    .eq('id', userId)
    .select('*')
    .single()

  if (error) throw error
  return data as ProfileRow
}

export async function isDniTaken(
  supabase: SupabaseClient,
  dni: string,
  excludeUserId?: string,
): Promise<boolean> {
  if (!dni) return false

  let query = supabase
    .from('profiles')
    .select('id')
    .eq('dni', dni)
    .limit(1)

  if (excludeUserId) {
    query = query.neq('id', excludeUserId)
  }

  const { data, error } = await query
  if (error) throw error
  return (data?.length ?? 0) > 0
}

export async function uploadAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)
    ? ext.replace('jpeg', 'jpg')
    : 'jpg'
  const path = `${userId}/avatar.${safeExt}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, {
      upsert: true,
      contentType: file.type || `image/${safeExt}`,
    })

  if (uploadError) throw uploadError

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path)

  const url = `${publicUrl}?t=${Date.now()}`
  return url
}

export async function fetchSponsorSubmissions(
  supabase: SupabaseClient,
  sponsorId: string,
): Promise<SponsorPrizeSubmission[]> {
  const { data, error } = await supabase
    .from('sponsor_prize_submissions')
    .select('*')
    .eq('sponsor_id', sponsorId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as SponsorPrizeSubmission[]
}

export async function createSponsorSubmission(
  supabase: SupabaseClient,
  sponsorId: string,
  input: {
    title: string
    detail: string
    sponsor_brand: string
    image_url?: string | null
  },
): Promise<SponsorPrizeSubmission> {
  const { data, error } = await supabase
    .from('sponsor_prize_submissions')
    .insert({
      sponsor_id: sponsorId,
      title: input.title.trim(),
      detail: input.detail.trim(),
      sponsor_brand: input.sponsor_brand.trim(),
      image_url: input.image_url ?? null,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as SponsorPrizeSubmission
}
