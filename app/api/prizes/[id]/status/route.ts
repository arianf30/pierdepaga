import { NextResponse } from 'next/server'
import { fetchProfile } from '@/lib/supabase/profiles'
import { updatePrizeSubmissionStatus } from '@/lib/supabase/prizes'
import { createClient } from '@/lib/supabase/server'
import type { SponsorPrizeStatus } from '@/lib/types/account'

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: RouteContext) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { id } = await context.params

  try {
    const profile = await fetchProfile(supabase, user.id)
    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = (await request.json()) as { status?: SponsorPrizeStatus }
    if (body.status !== 'approved' && body.status !== 'rejected') {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const submission = await updatePrizeSubmissionStatus(
      supabase,
      id,
      body.status,
    )

    return NextResponse.json({ submission })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudo actualizar el estado'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
