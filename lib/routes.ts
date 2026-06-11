export const routes = {
  landing: '/',
  home: '/inicio',
  ranking: '/ranking',
  prizes: '/premios',
  challenges: '/desafios',
  profile: '/perfil',
  login: '/login',
  player: (id: string) => `/jugador/${id}`,
} as const

export const navItems = [
  { href: routes.home, label: 'Inicio' },
  { href: routes.ranking, label: 'Ranking' },
  { href: routes.prizes, label: 'Premios' },
  { href: routes.challenges, label: 'Desafíos' },
] as const

export function playerProfilePath(playerId: string): string {
  if (playerId === 'me') return routes.profile
  return routes.player(playerId)
}

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href
}

export function isProfileActive(pathname: string): boolean {
  return pathname === routes.profile
}
