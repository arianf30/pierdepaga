import { NextResponse } from 'next/server'
import { isCountryId, isSportId } from '@/lib/catalog'
import { fetchProfile } from '@/lib/supabase/profiles'
import {
  createSponsorSubmission,
  fetchCatalogPrizesForScope,
  fetchPendingPrizeSubmissions,
  fetchSponsorSubmissionsForScope,
} from '@/lib/supabase/prizes'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const url = new URL(request.url)
  const moderation = url.searchParams.get('moderation') === '1'

  try {
    const profile = await fetchProfile(supabase, user.id)
    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    if (moderation) {
      if (!profile.is_admin) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      }
      const submissions = await fetchPendingPrizeSubmissions(supabase)
      return NextResponse.json({ submissions })
    }

    const countryId = url.searchParams.get('country_id') ?? 'ar'
    const province = url.searchParams.get('province') ?? ''
    const sportId = url.searchParams.get('sport_id') ?? 'padel'

    if (!isCountryId(countryId) || !isSportId(sportId) || !province.trim()) {
      return NextResponse.json({ error: 'Scope inválido' }, { status: 400 })
    }

    const scope = { countryId, province, sportId }
    const catalog = await fetchCatalogPrizesForScope(supabase, scope)

    if (profile.account_type === 'sponsor') {
      const submissions = await fetchSponsorSubmissionsForScope(
        supabase,
        user.id,
        scope,
      )
      return NextResponse.json({ catalog, submissions })
    }

    return NextResponse.json({ catalog })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudieron cargar los premios'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  try {
    const profile = await fetchProfile(supabase, user.id)
    if (!profile || profile.account_type !== 'sponsor') {
      return NextResponse.json({ error: 'Solo sponsors' }, { status: 403 })
    }

    const body = (await request.json()) as {
      country_id?: string
      province?: string
      sport_id?: string
      title?: string
      detail?: string
      sponsor_brand?: string
      image_url?: string | null
      prize_type?: 'ranking' | 'streak'
      ranking_position?: 1 | 2 | 3 | null
      streak_milestone?: number | null
      quantity_available?: number
    }

    const countryId = body.country_id ?? 'ar'
    const province = body.province?.trim() ?? ''
    const sportId = body.sport_id ?? 'padel'

    if (!isCountryId(countryId) || !isSportId(sportId) || !province) {
      return NextResponse.json({ error: 'Scope inválido' }, { status: 400 })
    }

    if (!body.title?.trim() || !body.sponsor_brand?.trim()) {
      return NextResponse.json({ error: 'Faltan datos del premio' }, { status: 400 })
    }

    if (body.prize_type !== 'ranking' && body.prize_type !== 'streak') {
      return NextResponse.json({ error: 'Tipo de premio inválido' }, { status: 400 })
    }

    const quantity = body.quantity_available ?? 1
    if (!Number.isFinite(quantity) || quantity < 1) {
      return NextResponse.json({ error: 'Cantidad inválida' }, { status: 400 })
    }

    const submission = await createSponsorSubmission(
      supabase,
      user.id,
      { countryId, province, sportId },
      {
        title: body.title,
        detail: body.detail ?? '',
        sponsor_brand: body.sponsor_brand,
        image_url: body.image_url ?? null,
        prize_type: body.prize_type,
        ranking_position:
          body.prize_type === 'ranking' ? (body.ranking_position ?? null) : null,
        streak_milestone:
          body.prize_type === 'streak' ? (body.streak_milestone ?? null) : null,
        quantity_available: quantity,
      },
    )

    return NextResponse.json({ submission })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudo crear la postulación'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
