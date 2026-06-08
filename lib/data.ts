export type View = 'home' | 'ranking' | 'profile' | 'challenges' | 'soon'

export type Player = {
  id: string
  name: string
  handle: string
  avatar: string
  rank: number
  tier: string
  level: number
  wins: number
  losses: number
  streak: number
  rating: number
  region: string
  status: 'online' | 'in-match' | 'offline'
}

export const me: Player = {
  id: 'me',
  name: 'Marco Vidal',
  handle: '@elmuro',
  avatar: '/player-1.png',
  rank: 7,
  tier: 'Diamante II',
  level: 42,
  wins: 184,
  losses: 63,
  streak: 6,
  rating: 2480,
  region: 'Buenos Aires',
  status: 'online',
}

export const topPlayers: Player[] = [
  {
    id: 'p2',
    name: 'Sofía Reyes',
    handle: '@sofireyes',
    avatar: '/player-2.png',
    rank: 1,
    tier: 'Leyenda Apex',
    level: 88,
    wins: 412,
    losses: 71,
    streak: 14,
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
    tier: 'Leyenda Apex',
    level: 81,
    wins: 388,
    losses: 90,
    streak: 9,
    rating: 3110,
    region: 'La Plata',
    status: 'online',
  },
  {
    id: 'p1',
    name: 'Marco Vidal',
    handle: '@elmuro',
    avatar: '/player-1.png',
    rank: 3,
    tier: 'Diamante I',
    level: 42,
    wins: 184,
    losses: 63,
    streak: 6,
    rating: 2480,
    region: 'Buenos Aires',
    status: 'online',
  },
]

export const leaderboard: Player[] = [
  ...topPlayers,
  {
    id: 'p4',
    name: 'Lucía Fernández',
    handle: '@luciaf',
    avatar: '/player-2.png',
    rank: 4,
    tier: 'Diamante I',
    level: 67,
    wins: 301,
    losses: 88,
    streak: 4,
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
    tier: 'Diamante II',
    level: 59,
    wins: 277,
    losses: 102,
    streak: 2,
    rating: 2310,
    region: 'Córdoba',
    status: 'offline',
  },
  {
    id: 'p6',
    name: 'Elena Castro',
    handle: '@elenac',
    avatar: '/player-2.png',
    rank: 6,
    tier: 'Platino I',
    level: 51,
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
    rank: 7,
    tier: 'Platino I',
    level: 48,
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
    rank: 8,
    tier: 'Platino II',
    level: 44,
    wins: 198,
    losses: 121,
    streak: 3,
    rating: 2090,
    region: 'Tigre',
    status: 'online',
  },
]

export const challengers: Player[] = leaderboard.filter((p) => p.id !== 'p1')

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

export type MatchTypeLabel = 'Partido normal' | 'Partido desafío' | 'Pierde paga'

export type ChallengeInvite = {
  id: string
  player: Player
  matchType: MatchTypeLabel
  stake: string
  expires: string
}

export const incomingChallenges: ChallengeInvite[] = [
  {
    id: 'c1',
    player: leaderboard[6],
    matchType: 'Pierde paga',
    stake: '$10.000',
    expires: '11 h',
  },
  {
    id: 'c2',
    player: leaderboard[4],
    matchType: 'Partido desafío',
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
  type: 'Normal' | 'Desafío' | 'Pierde paga'
  result: 'G' | 'P'
  score: string
  date: string
}

export const matchHistory: MatchRecord[] = [
  {
    id: 'm1',
    opponent: 'Diego Marín',
    avatar: '/player-3.png',
    type: 'Pierde paga',
    result: 'G',
    score: '6-4 7-5',
    date: 'Hoy',
  },
  {
    id: 'm2',
    opponent: 'Sofía Reyes',
    avatar: '/player-2.png',
    type: 'Desafío',
    result: 'P',
    score: '3-6 4-6',
    date: 'Ayer',
  },
  {
    id: 'm3',
    opponent: 'Hugo Navarro',
    avatar: '/player-3.png',
    type: 'Pierde paga',
    result: 'G',
    score: '6-2 6-3',
    date: 'hace 2 d',
  },
  {
    id: 'm4',
    opponent: 'Carla Ortega',
    avatar: '/player-2.png',
    type: 'Normal',
    result: 'G',
    score: '7-6 6-4',
    date: 'hace 4 d',
  },
  {
    id: 'm5',
    opponent: 'Tomás Aguilar',
    avatar: '/player-3.png',
    type: 'Desafío',
    result: 'P',
    score: '5-7 6-7',
    date: 'hace 5 d',
  },
]
