import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { confirmMatch } from '@/lib/supabase/game'

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(_request: Request, context: RouteContext) {
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
    const match = await confirmMatch(supabase, id, user.id)
    return NextResponse.json({ match })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'No se pudo confirmar el partido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
