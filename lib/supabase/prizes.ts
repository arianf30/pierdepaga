import type { SupabaseClient } from '@supabase/supabase-js'
import type { CountryId, SportId } from '@/lib/catalog'
import type { SponsorPrizeSubmission } from '@/lib/types/account'

export async function resolveScopeId(
  supabase: SupabaseClient,
  countryId: CountryId,
  province: string,
  sportId: SportId,
): Promise<string> {
  const { data, error } = await supabase.rpc('get_or_create_ranking_scope', {
    p_country_id: countryId,
    p_province: province,
    p_sport_id: sportId,
  })

  if (error) throw error
  return data as string
}

export async function fetchCatalogPrizesForScope(
  supabase: SupabaseClient,
  scope: { countryId: CountryId; province: string; sportId: SportId },
): Promise<SponsorPrizeSubmission[]> {
  const { data, error } = await supabase
    .from('sponsor_prize_submissions')
    .select('*')
    .eq('country_id', scope.countryId)
    .eq('province', scope.province)
    .eq('sport_id', scope.sportId)
    .in('status', ['approved', 'pending'])
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as SponsorPrizeSubmission[]
}

/** @deprecated Usar fetchCatalogPrizesForScope */
export async function fetchApprovedPrizesForScope(
  supabase: SupabaseClient,
  scope: { countryId: CountryId; province: string; sportId: SportId },
): Promise<SponsorPrizeSubmission[]> {
  return fetchCatalogPrizesForScope(supabase, scope)
}

export async function fetchSponsorSubmissionsForScope(
  supabase: SupabaseClient,
  userId: string,
  scope: { countryId: CountryId; province: string; sportId: SportId },
): Promise<SponsorPrizeSubmission[]> {
  const { data, error } = await supabase
    .from('sponsor_prize_submissions')
    .select('*')
    .eq('user_id', userId)
    .eq('country_id', scope.countryId)
    .eq('province', scope.province)
    .eq('sport_id', scope.sportId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as SponsorPrizeSubmission[]
}

export async function fetchPendingPrizeSubmissions(
  supabase: SupabaseClient,
): Promise<SponsorPrizeSubmission[]> {
  const { data, error } = await supabase
    .from('sponsor_prize_submissions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as SponsorPrizeSubmission[]
}

export async function createSponsorSubmission(
  supabase: SupabaseClient,
  userId: string,
  scope: { countryId: CountryId; province: string; sportId: SportId },
  input: {
    title: string
    detail: string
    sponsor_brand: string
    image_url?: string | null
    prize_type: 'ranking' | 'streak'
    ranking_position?: 1 | 2 | 3 | null
    streak_milestone?: number | null
    quantity_available: number
  },
): Promise<SponsorPrizeSubmission> {
  const scopeId = await resolveScopeId(
    supabase,
    scope.countryId,
    scope.province,
    scope.sportId,
  )

  const { data, error } = await supabase
    .from('sponsor_prize_submissions')
    .insert({
      user_id: userId,
      country_id: scope.countryId,
      province: scope.province,
      sport_id: scope.sportId,
      scope_id: scopeId,
      title: input.title.trim(),
      detail: input.detail.trim(),
      sponsor_brand: input.sponsor_brand.trim(),
      image_url: input.image_url ?? null,
      prize_type: input.prize_type,
      ranking_position:
        input.prize_type === 'ranking' ? (input.ranking_position ?? null) : null,
      streak_milestone:
        input.prize_type === 'streak' ? (input.streak_milestone ?? null) : null,
      quantity_available: input.quantity_available,
      status: 'pending',
    })
    .select('*')
    .single()

  if (error) throw error
  return data as SponsorPrizeSubmission
}

export async function updatePrizeSubmissionStatus(
  supabase: SupabaseClient,
  submissionId: string,
  status: 'approved' | 'rejected',
): Promise<SponsorPrizeSubmission> {
  const { data, error } = await supabase
    .from('sponsor_prize_submissions')
    .update({ status })
    .eq('id', submissionId)
    .select('*')
    .single()

  if (error) throw error
  return data as SponsorPrizeSubmission
}
