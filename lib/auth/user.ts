import type { User } from '@supabase/supabase-js'

export function getDisplayName(user: User): string {
  return (
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split('@')[0] ??
    'Jugador'
  )
}

export function getAvatarUrl(user: User): string | undefined {
  const url = user.user_metadata?.avatar_url
  return typeof url === 'string' ? url : undefined
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase()
}

export function getHandle(user: User): string {
  const email = user.email ?? 'jugador'
  const local = email.split('@')[0] ?? 'jugador'
  return `@${local}`
}
