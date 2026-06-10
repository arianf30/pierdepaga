import { POSITIVE_STREAK_MILESTONES } from '@/lib/streaks'

export type View =
  | 'home'
  | 'ranking'
  | 'prizes'
  | 'challenges'
  | 'profile'
  | 'player-profile'
  | 'notifications'
  | 'soon'

export type Player = {
  id: string
  name: string
  handle: string
  avatar: string
  rank: number
  /** Cambio de puesto reciente. Positivo = subió, negativo = bajó. */
  rankDelta: number
  tier: string
  wins: number
  losses: number
  streak: number
  rating: number
  region: string
  status: 'online' | 'in-match' | 'offline'
}

export type PlayerProfileData = {
  firstName: string
  lastName: string
  instagram?: string
  dni: string
  avatar: string
  setsWon: number
  setsLost: number
  gamesWon: number
  gamesLost: number
}

export const defaultProfile: PlayerProfileData = {
  firstName: 'Marco',
  lastName: 'Vidal',
  instagram: '',
  dni: '30123456',
  avatar: '/player-1.png',
  setsWon: 412,
  setsLost: 198,
  gamesWon: 2840,
  gamesLost: 2210,
}

/** DNIs ya registrados (mock hasta conectar Supabase). */
export const takenDnis = new Set(['28999888', '30111222'])

export type WonPrize = {
  id: string
  name: string
  detail: string
  sponsor?: string
  date: string
  type: 'ranking' | 'racha'
}

export const wonPrizes: WonPrize[] = [
  {
    id: 'wp1',
    name: 'Cubregrip PierdePaga',
    detail: `Racha de +${POSITIVE_STREAK_MILESTONES[0]} victorias`,
    sponsor: 'Paddle Pro',
    date: 'Mar 2026',
    type: 'racha',
  },
  {
    id: 'wp2',
    name: 'Remera edición limitada',
    detail: `Racha de +${POSITIVE_STREAK_MILESTONES[1]} victorias`,
    sponsor: 'SportZone',
    date: 'Feb 2026',
    type: 'racha',
  },
]

export const me: Player = {
  id: 'me',
  name: 'Marco Vidal',
  handle: '@elmuro',
  avatar: '/player-1.png',
  rank: 7,
  rankDelta: 2,
  tier: 'Diamante II',
  wins: 184,
  losses: 63,
  streak: 2,
  rating: 2480,
  region: 'Buenos Aires',
  status: 'online',
}

export const topPlayers: Player[] = []

export const leaderboard: Player[] = [
  {
    id: 'p2',
    name: 'Sofía Reyes',
    handle: '@sofireyes',
    avatar: '/player-2.png',
    rank: 1,
    rankDelta: 0,
    tier: 'Leyenda Apex',
    wins: 412,
    losses: 71,
    streak: 3,
    rating: 3240,
    region: 'CABA',
    status: 'in-match',
  },
  {
    id: 'p3',
    name: 'Diego Marín',
    handle: '@dmarin',
    avatar: '/player-3.png',
    rank: 2,
    rankDelta: 1,
    tier: 'Leyenda Apex',
    wins: 388,
    losses: 90,
    streak: 8,
    rating: 3110,
    region: 'La Plata',
    status: 'online',
  },
  {
    id: 'p9',
    name: 'Valentina Ríos',
    handle: '@valrios',
    avatar: '/player-2.png',
    rank: 3,
    rankDelta: 2,
    tier: 'Diamante I',
    wins: 356,
    losses: 82,
    streak: 2,
    rating: 2980,
    region: 'CABA',
    status: 'online',
  },
  {
    id: 'p4',
    name: 'Lucía Fernández',
    handle: '@luciaf',
    avatar: '/player-2.png',
    rank: 4,
    rankDelta: -1,
    tier: 'Diamante I',
    wins: 301,
    losses: 88,
    streak: 1,
    rating: 2390,
    region: 'Rosario',
    status: 'online',
  },
  {
    id: 'p5',
    name: 'Tomás Aguilar',
    handle: '@taguilar',
    avatar: '/player-3.png',
    rank: 5,
    rankDelta: 0,
    tier: 'Diamante II',
    wins: 277,
    losses: 102,
    streak: 5,
    rating: 2310,
    region: 'Córdoba',
    status: 'offline',
  },
  {
    id: 'p10',
    name: 'Nicolás Pereyra',
    handle: '@nicop',
    avatar: '/player-3.png',
    rank: 6,
    rankDelta: 1,
    tier: 'Diamante II',
    wins: 265,
    losses: 98,
    streak: 3,
    rating: 2260,
    region: 'Resistencia',
    status: 'online',
  },
  {
    id: 'me',
    name: 'Marco Vidal',
    handle: '@elmuro',
    avatar: '/player-1.png',
    rank: 7,
    rankDelta: 2,
    tier: 'Diamante II',
    wins: 184,
    losses: 63,
    streak: 2,
    rating: 2480,
    region: 'Buenos Aires',
    status: 'online',
  },
  {
    id: 'p6',
    name: 'Elena Castro',
    handle: '@elenac',
    avatar: '/player-2.png',
    rank: 8,
    rankDelta: -1,
    tier: 'Platino I',
    wins: 240,
    losses: 95,
    streak: 1,
    rating: 2240,
    region: 'Mendoza',
    status: 'in-match',
  },
  {
    id: 'p7',
    name: 'Hugo Navarro',
    handle: '@hnavarro',
    avatar: '/player-3.png',
    rank: 9,
    rankDelta: 0,
    tier: 'Platino I',
    wins: 219,
    losses: 110,
    streak: 0,
    rating: 2180,
    region: 'Mar del Plata',
    status: 'online',
  },
  {
    id: 'p8',
    name: 'Carla Ortega',
    handle: '@carlao',
    avatar: '/player-2.png',
    rank: 10,
    rankDelta: -2,
    tier: 'Platino II',
    wins: 198,
    losses: 121,
    streak: -3,
    rating: 2090,
    region: 'Tigre',
    status: 'online',
  },
  {
    id: 'p11',
    name: 'Facundo López',
    handle: '@facul',
    avatar: '/player-1.png',
    rank: 11,
    rankDelta: -1,
    tier: 'Platino II',
    wins: 187,
    losses: 115,
    streak: -5,
    rating: 2050,
    region: 'Formosa',
    status: 'offline',
  },
  {
    id: 'p12',
    name: 'Camila Duarte',
    handle: '@camid',
    avatar: '/player-2.png',
    rank: 12,
    rankDelta: 1,
    tier: 'Platino II',
    wins: 176,
    losses: 108,
    streak: -1,
    rating: 2010,
    region: 'Corrientes',
    status: 'online',
  },
  {
    id: 'p13',
    name: 'Javier Morales',
    handle: '@javierm',
    avatar: '/player-3.png',
    rank: 13,
    rankDelta: 0,
    tier: 'Oro I',
    wins: 165,
    losses: 112,
    streak: 1,
    rating: 1980,
    region: 'Resistencia',
    status: 'in-match',
  },
  {
    id: 'p14',
    name: 'Paula Méndez',
    handle: '@paulam',
    avatar: '/player-2.png',
    rank: 14,
    rankDelta: -1,
    tier: 'Oro I',
    wins: 158,
    losses: 119,
    streak: -3,
    rating: 1920,
    region: 'Formosa',
    status: 'online',
  },
  {
    id: 'p15',
    name: 'Ricardo Soto',
    handle: '@richs',
    avatar: '/player-3.png',
    rank: 15,
    rankDelta: 1,
    tier: 'Oro II',
    wins: 142,
    losses: 124,
    streak: -2,
    rating: 1860,
    region: 'Corrientes',
    status: 'offline',
  },
  {
    id: 'p16',
    name: 'Andrea Villalba',
    handle: '@andrev',
    avatar: '/player-2.png',
    rank: 16,
    rankDelta: 2,
    tier: 'Oro II',
    wins: 131,
    losses: 128,
    streak: 3,
    rating: 1810,
    region: 'Formosa',
    status: 'online',
  },
  {
    id: 'p17',
    name: 'Gonzalo Paz',
    handle: '@gonpaz',
    avatar: '/player-1.png',
    rank: 17,
    rankDelta: -2,
    tier: 'Oro II',
    wins: 120,
    losses: 130,
    streak: -5,
    rating: 1750,
    region: 'Resistencia',
    status: 'online',
  },
  {
    id: 'p18',
    name: 'Martina Acosta',
    handle: '@martia',
    avatar: '/player-2.png',
    rank: 18,
    rankDelta: 0,
    tier: 'Plata I',
    wins: 108,
    losses: 135,
    streak: -2,
    rating: 1690,
    region: 'Corrientes',
    status: 'offline',
  },
  {
    id: 'p19',
    name: 'Leandro Funes',
    handle: '@leof',
    avatar: '/player-3.png',
    rank: 19,
    rankDelta: -3,
    tier: 'Plata I',
    wins: 95,
    losses: 140,
    streak: -8,
    rating: 1620,
    region: 'Formosa',
    status: 'online',
  },
  {
    id: 'p20',
    name: 'Bianca Romero',
    handle: '@biancar',
    avatar: '/player-2.png',
    rank: 20,
    rankDelta: 1,
    tier: 'Plata II',
    wins: 88,
    losses: 148,
    streak: -1,
    rating: 1550,
    region: 'Resistencia',
    status: 'in-match',
  },
  {
    id: 'p21',
    name: 'Sebastián Vera',
    handle: '@sebvera',
    avatar: '/player-1.png',
    rank: 21,
    rankDelta: 0,
    tier: 'Plata II',
    wins: 76,
    losses: 152,
    streak: 0,
    rating: 1480,
    region: 'Corrientes',
    status: 'online',
  },
  {
    id: 'p22',
    name: 'Florencia Núñez',
    handle: '@florn',
    avatar: '/player-2.png',
    rank: 22,
    rankDelta: -1,
    tier: 'Bronce I',
    wins: 64,
    losses: 158,
    streak: -11,
    rating: 1410,
    region: 'Formosa',
    status: 'offline',
  },
]

export const challengers: Player[] = leaderboard.filter((p) => p.id !== 'me')

export const RANKING_PAGE_SIZE = 10

export type Activity = {
  id: string
  type: 'win' | 'loss' | 'challenge' | 'rank'
  title: string
  detail: string
  time: string
  amount?: string
}

export const recentActivity: Activity[] = [
  {
    id: 'a1',
    type: 'win',
    title: 'Victoria vs Diego Marín',
    detail: 'Pierde paga · 6-4 7-5',
    time: 'hace 2 h',
    amount: '+$8.000',
  },
  {
    id: 'a2',
    type: 'rank',
    title: 'Ascenso a Diamante II',
    detail: 'Subiste 2 posiciones en el ranking global',
    time: 'hace 5 h',
  },
  {
    id: 'a3',
    type: 'loss',
    title: 'Derrota vs Sofía Reyes',
    detail: 'Partido desafío · 3-6 4-6',
    time: 'hace 1 d',
    amount: '-$5.000',
  },
  {
    id: 'a4',
    type: 'challenge',
    title: 'Nuevo desafío recibido',
    detail: 'Hugo Navarro quiere una revancha pierde paga',
    time: 'hace 1 d',
  },
]

export type MatchType = 'Partido simple' | 'Desafío pierde paga'

export type ChallengeInvite = {
  id: string
  player: Player
  matchType: MatchType
  stake: string
  expires: string
}

export type ScheduledMatch = {
  id: string
  type: MatchType
  club: string
  scheduledAt: string
  teamA: [Player, Player]
  teamB: [Player, Player]
  stake?: string
}

export const scheduledMatches: ScheduledMatch[] = [
  {
    id: 's1',
    type: 'Desafío pierde paga',
    club: 'Club Padel Formosa',
    scheduledAt: 'Hoy · 18:30',
    teamA: [leaderboard[2], leaderboard[5]],
    teamB: [leaderboard[1], leaderboard[3]],
    stake: '$10.000',
  },
  {
    id: 's2',
    type: 'Partido simple',
    club: 'Arena Norte',
    scheduledAt: 'Mañana · 10:00',
    teamA: [leaderboard[0], leaderboard[4]],
    teamB: [leaderboard[6], leaderboard[7]],
  },
  {
    id: 's3',
    type: 'Desafío pierde paga',
    club: 'Padel Center Resistencia',
    scheduledAt: 'Sáb · 20:00',
    teamA: [leaderboard[3], leaderboard[4]],
    teamB: [leaderboard[0], leaderboard[2]],
    stake: '$15.000',
  },
]

export type DoublesSides = {
  teamA: [Player, Player]
  teamB: [Player, Player]
}

export type PlayedDoublesMatch = DoublesSides & {
  id: string
  type: MatchType
  winnerTeam: 'A' | 'B'
  score: string
  time: string
  stake?: string
  skillTransferred?: number
}

/** Menor = más reciente. */
export const playedDoublesMatches: PlayedDoublesMatch[] = [
  {
    id: 'p1',
    type: 'Desafío pierde paga',
    teamA: [leaderboard[2], leaderboard[5]],
    teamB: [leaderboard[1], leaderboard[3]],
    winnerTeam: 'A',
    score: '6-4 6-3',
    time: 'hace 2 h',
    stake: '$10.000',
    skillTransferred: 48,
  },
  {
    id: 'p2',
    type: 'Partido simple',
    teamA: [leaderboard[1], leaderboard[4]],
    teamB: [leaderboard[6], leaderboard[7]],
    winnerTeam: 'A',
    score: '6-3 6-4',
    time: 'hace 4 h',
  },
  {
    id: 'p3',
    type: 'Desafío pierde paga',
    teamA: [leaderboard[0], leaderboard[2]],
    teamB: [leaderboard[1], leaderboard[3]],
    winnerTeam: 'B',
    score: '4-6 3-6',
    time: 'hace 6 h',
    stake: '$8.000',
    skillTransferred: 62,
  },
  {
    id: 'p4',
    type: 'Partido simple',
    teamA: [leaderboard[0], leaderboard[3]],
    teamB: [leaderboard[4], leaderboard[5]],
    winnerTeam: 'A',
    score: '7-6 6-2',
    time: 'hace 8 h',
  },
  {
    id: 'p5',
    type: 'Desafío pierde paga',
    teamA: [leaderboard[3], leaderboard[4]],
    teamB: [leaderboard[0], leaderboard[1]],
    winnerTeam: 'A',
    score: '7-6 6-4',
    time: 'ayer',
    stake: '$12.000',
    skillTransferred: 55,
  },
  {
    id: 'p6',
    type: 'Partido simple',
    teamA: [leaderboard[2], leaderboard[5]],
    teamB: [leaderboard[6], leaderboard[7]],
    winnerTeam: 'A',
    score: '6-1 6-2',
    time: 'ayer',
  },
]

export function doublesSkillTotal(match: DoublesSides): number {
  return [...match.teamA, ...match.teamB].reduce((sum, p) => sum + p.rating, 0)
}

export function teamLabel(players: [Player, Player]): string {
  return `${players[0].name.split(' ')[0]} & ${players[1].name.split(' ')[0]}`
}

const HIGH_STAKES_SKILL = 9000

export function isHighStakesMatch(match: PlayedDoublesMatch): boolean {
  return (
    match.type === 'Desafío pierde paga' &&
    doublesSkillTotal(match) >= HIGH_STAKES_SKILL
  )
}

/** Feed con desafíos de alto nivel arriba; el resto en orden de llegada. */
export function buildArenaFeed(matches: PlayedDoublesMatch[]): PlayedDoublesMatch[] {
  return [...matches]
    .map((m, i) => ({ m, i }))
    .sort((a, b) => {
      const aBoost = isHighStakesMatch(a.m) ? 0 : 1
      const bBoost = isHighStakesMatch(b.m) ? 0 : 1
      if (aBoost !== bBoost) return aBoost - bBoost
      return a.i - b.i
    })
    .map(({ m }) => m)
}

export const incomingChallenges: ChallengeInvite[] = [
  {
    id: 'c1',
    player: leaderboard[6],
    matchType: 'Desafío pierde paga',
    stake: '$10.000',
    expires: '11 h',
  },
  {
    id: 'c2',
    player: leaderboard[4],
    matchType: 'Desafío pierde paga',
    stake: '$4.000',
    expires: '1 d',
  },
]

export type Achievement = {
  id: string
  name: string
  detail: string
  rarity: 'común' | 'raro' | 'épico' | 'legendario'
  unlocked: boolean
}

export const achievements: Achievement[] = [
  {
    id: 'ac1',
    name: 'Primera sangre',
    detail: 'Ganá tu primer partido pierde paga',
    rarity: 'común',
    unlocked: true,
  },
  {
    id: 'ac2',
    name: 'Racha ganadora',
    detail: 'Ganá 5 partidos seguidos',
    rarity: 'raro',
    unlocked: true,
  },
  {
    id: 'ac3',
    name: 'Intocable',
    detail: 'Ganá un partido 6-0 6-0',
    rarity: 'épico',
    unlocked: true,
  },
  {
    id: 'ac4',
    name: 'Gigante asesino',
    detail: 'Vencé a un rival del top 3',
    rarity: 'épico',
    unlocked: true,
  },
  {
    id: 'ac5',
    name: 'Depredador apex',
    detail: 'Llegá al puesto #1 del ranking global',
    rarity: 'legendario',
    unlocked: false,
  },
  {
    id: 'ac6',
    name: 'Billetera llena',
    detail: 'Ganá $500.000 en apuestas pierde paga',
    rarity: 'legendario',
    unlocked: false,
  },
]

export type MatchRecord = {
  id: string
  opponent: string
  avatar: string
  type: MatchType
  result: 'G' | 'P'
  score: string
  date: string
}

export const matchHistory: MatchRecord[] = [
  {
    id: 'm1',
    opponent: 'Diego Marín',
    avatar: '/player-3.png',
    type: 'Desafío pierde paga',
    result: 'G',
    score: '6-4 7-5',
    date: 'Hoy',
  },
  {
    id: 'm2',
    opponent: 'Sofía Reyes',
    avatar: '/player-2.png',
    type: 'Partido simple',
    result: 'P',
    score: '3-6 4-6',
    date: 'Ayer',
  },
  {
    id: 'm3',
    opponent: 'Hugo Navarro',
    avatar: '/player-3.png',
    type: 'Desafío pierde paga',
    result: 'G',
    score: '6-2 6-3',
    date: 'hace 2 d',
  },
  {
    id: 'm4',
    opponent: 'Carla Ortega',
    avatar: '/player-2.png',
    type: 'Partido simple',
    result: 'G',
    score: '7-6 6-4',
    date: 'hace 4 d',
  },
  {
    id: 'm5',
    opponent: 'Tomás Aguilar',
    avatar: '/player-3.png',
    type: 'Partido simple',
    result: 'P',
    score: '5-7 6-7',
    date: 'hace 5 d',
  },
  {
    id: 'm6',
    opponent: 'Elena Castro',
    avatar: '/player-2.png',
    type: 'Desafío pierde paga',
    result: 'G',
    score: '6-3 6-1',
    date: 'hace 6 d',
  },
  {
    id: 'm7',
    opponent: 'Lucía Fernández',
    avatar: '/player-2.png',
    type: 'Partido simple',
    result: 'G',
    score: '6-4 3-6 10-7',
    date: 'hace 8 d',
  },
]

export const PROFILE_MATCH_PREVIEW = 4

export type PublicPlayerProfile = {
  player: Player
  profile: {
    firstName: string
    lastName: string
    instagram?: string
    avatar: string
    setsWon: number
    setsLost: number
    gamesWon: number
    gamesLost: number
  }
  matchHistory: MatchRecord[]
  prizes: WonPrize[]
  regionLabel: string
}

function splitPlayerName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return { firstName: 'Jugador', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

function deriveProfileStats(player: Player) {
  return {
    setsWon: Math.round(player.wins * 2.2),
    setsLost: Math.round(player.losses * 2.1),
    gamesWon: Math.round(player.wins * 14.2),
    gamesLost: Math.round(player.losses * 13.8),
  }
}

const MOCK_INSTAGRAM: Record<string, string> = {
  p2: '@sofireyes',
  p3: '@dmarin',
  p4: '@luciaf',
  p5: '@taguilar',
  p9: '@valrios',
  p10: '@nicop',
}

function buildMockMatchHistory(player: Player): MatchRecord[] {
  const opponents = leaderboard
    .filter((p) => p.id !== player.id)
    .sort((a, b) => a.rank - b.rank)

  const dates = ['Hoy', 'Ayer', 'hace 2 d', 'hace 4 d', 'hace 6 d', 'hace 8 d']
  const types: MatchType[] = ['Partido simple', 'Desafío pierde paga']
  const scores = ['6-4 7-5', '3-6 4-6', '6-2 6-3', '7-6 6-4', '5-7 6-7', '6-3 6-1']

  return opponents.slice(0, 6).map((opp, i) => ({
    id: `${player.id}-m${i}`,
    opponent: opp.name,
    avatar: opp.avatar,
    type: types[i % types.length],
    result: i % 3 === 1 ? 'P' : 'G',
    score: scores[i % scores.length],
    date: dates[i % dates.length],
  }))
}

function buildMockPrizes(player: Player): WonPrize[] {
  const prizes: WonPrize[] = []

  if (player.streak >= POSITIVE_STREAK_MILESTONES[0]) {
    prizes.push({
      id: `${player.id}-wp1`,
      name: 'Cubregrip PierdePaga',
      detail: `Racha de +${POSITIVE_STREAK_MILESTONES[0]} victorias`,
      sponsor: 'Paddle Pro',
      date: 'Mar 2026',
      type: 'racha',
    })
  }

  if (player.streak >= POSITIVE_STREAK_MILESTONES[1]) {
    prizes.push({
      id: `${player.id}-wp2`,
      name: 'Remera edición limitada',
      detail: `Racha de +${POSITIVE_STREAK_MILESTONES[1]} victorias`,
      sponsor: 'SportZone',
      date: 'Feb 2026',
      type: 'racha',
    })
  }

  if (player.rank <= 3) {
    prizes.push({
      id: `${player.id}-wp3`,
      name: 'Top 3 regional',
      detail: `Podio del ranking · puesto #${player.rank}`,
      date: 'Jun 2026',
      type: 'ranking',
    })
  }

  return prizes
}

export function getPlayerById(playerId: string): Player | undefined {
  if (playerId === 'me') return me
  return leaderboard.find((p) => p.id === playerId)
}

export function getPublicPlayerProfile(
  playerId: string,
): PublicPlayerProfile | null {
  const player = getPlayerById(playerId)
  if (!player) return null

  if (playerId === 'me') {
    const { firstName, lastName } = splitPlayerName(player.name)
    return {
      player,
      profile: {
        firstName: defaultProfile.firstName || firstName,
        lastName: defaultProfile.lastName || lastName,
        instagram: defaultProfile.instagram || undefined,
        avatar: defaultProfile.avatar || player.avatar,
        setsWon: defaultProfile.setsWon,
        setsLost: defaultProfile.setsLost,
        gamesWon: defaultProfile.gamesWon,
        gamesLost: defaultProfile.gamesLost,
      },
      matchHistory,
      prizes: wonPrizes,
      regionLabel: player.region,
    }
  }

  const { firstName, lastName } = splitPlayerName(player.name)
  const stats = deriveProfileStats(player)

  return {
    player,
    profile: {
      firstName,
      lastName,
      instagram: MOCK_INSTAGRAM[player.id],
      avatar: player.avatar,
      ...stats,
    },
    matchHistory: buildMockMatchHistory(player),
    prizes: buildMockPrizes(player),
    regionLabel: player.region,
  }
}
