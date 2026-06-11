import {
  CHALLENGE_SKILL_RANGE,
  leaderboard,
  me,
  type Player,
} from '@/lib/data'

const p = (id: string): Player => {
  if (id === 'me') return me
  const found = leaderboard.find((player) => player.id === id)
  if (!found) throw new Error(`Player ${id} not found`)
  return found
}

export type SimpleMatchConfirmation = {
  playerId: string
  confirmed: boolean
}

export type PendingSimpleMatch = {
  id: string
  loadedById: string
  playedAt: string
  sortOrder: number
  club: string
  teamA: [Player, Player]
  teamB: [Player, Player]
  score: string
  winnerTeam: 'A' | 'B'
  confirmations: SimpleMatchConfirmation[]
}

export type PierdePagaChallengeStep =
  | 'awaiting_partner'
  | 'awaiting_opponent_partner'
  | 'ready'

export type PendingPierdePagaChallenge = {
  id: string
  proposedAt: string
  sortOrder: number
  club: string
  stake: string
  challenger: Player
  challengerPartner: Player
  challenged: Player
  challengedPartner: Player | null
  challengerPartnerConfirmed: boolean
  step: PierdePagaChallengeStep
}

export const SIMPLE_MATCH_CONFIRMATIONS_REQUIRED = 3

export const pendingSimpleMatches: PendingSimpleMatch[] = [
  {
    id: 'psm1',
    loadedById: 'me',
    playedAt: 'Hoy · 09:30',
    sortOrder: 1,
    club: 'Arena Norte',
    teamA: [p('me'), p('p4')],
    teamB: [p('p6'), p('p7')],
    score: '6-4 6-3',
    winnerTeam: 'A',
    confirmations: [
      { playerId: 'me', confirmed: true },
      { playerId: 'p4', confirmed: false },
      { playerId: 'p6', confirmed: false },
      { playerId: 'p7', confirmed: false },
    ],
  },
  {
    id: 'psm2',
    loadedById: 'p3',
    playedAt: 'Hoy · 11:00',
    sortOrder: 2,
    club: 'Club Padel Formosa',
    teamA: [p('p3'), p('p9')],
    teamB: [p('me'), p('p6')],
    score: '3-6 4-6',
    winnerTeam: 'B',
    confirmations: [
      { playerId: 'p3', confirmed: true },
      { playerId: 'p9', confirmed: true },
      { playerId: 'me', confirmed: false },
      { playerId: 'p6', confirmed: false },
    ],
  },
  {
    id: 'psm3',
    loadedById: 'me',
    playedAt: 'Ayer · 19:15',
    sortOrder: 3,
    club: 'Padel Center Resistencia',
    teamA: [p('me'), p('p5')],
    teamB: [p('p8'), p('p11')],
    score: '7-6 6-4',
    winnerTeam: 'A',
    confirmations: [
      { playerId: 'me', confirmed: true },
      { playerId: 'p5', confirmed: true },
      { playerId: 'p8', confirmed: true },
      { playerId: 'p11', confirmed: false },
    ],
  },
  {
    id: 'psm4',
    loadedById: 'p7',
    playedAt: 'Ayer · 20:45',
    sortOrder: 4,
    club: 'Green Padel Club',
    teamA: [p('me'), p('p8')],
    teamB: [p('p7'), p('p12')],
    score: '6-2 6-1',
    winnerTeam: 'A',
    confirmations: [
      { playerId: 'me', confirmed: true },
      { playerId: 'p8', confirmed: false },
      { playerId: 'p7', confirmed: true },
      { playerId: 'p12', confirmed: false },
    ],
  },
  {
    id: 'psm5',
    loadedById: 'p2',
    playedAt: 'hace 2 d',
    sortOrder: 5,
    club: 'Top Padel CABA',
    teamA: [p('p2'), p('p4')],
    teamB: [p('p5'), p('p10')],
    score: '6-3 7-5',
    winnerTeam: 'A',
    confirmations: [
      { playerId: 'p2', confirmed: true },
      { playerId: 'p4', confirmed: false },
      { playerId: 'p5', confirmed: false },
      { playerId: 'p10', confirmed: false },
    ],
  },
  {
    id: 'psm6',
    loadedById: 'me',
    playedAt: 'hace 3 d',
    sortOrder: 6,
    club: 'Sunset Padel Bar',
    teamA: [p('me'), p('p6')],
    teamB: [p('p11'), p('p13')],
    score: '4-6 6-4 6-3',
    winnerTeam: 'A',
    confirmations: [
      { playerId: 'me', confirmed: true },
      { playerId: 'p6', confirmed: true },
      { playerId: 'p11', confirmed: true },
      { playerId: 'p13', confirmed: false },
    ],
  },
].sort((a, b) => a.sortOrder - b.sortOrder)

export const pendingPierdePagaChallenges: PendingPierdePagaChallenge[] = [
  {
    id: 'ppc1',
    proposedAt: 'Hoy · 21:00',
    sortOrder: 1,
    club: 'Club Padel Formosa',
    stake: '$12.000',
    challenger: p('me'),
    challengerPartner: p('p5'),
    challenged: p('p7'),
    challengedPartner: null,
    challengerPartnerConfirmed: false,
    step: 'awaiting_partner',
  },
  {
    id: 'ppc2',
    proposedAt: 'Mañana · 18:30',
    sortOrder: 2,
    club: 'Arena Norte',
    stake: '$8.000',
    challenger: p('p3'),
    challengerPartner: p('me'),
    challenged: p('p9'),
    challengedPartner: null,
    challengerPartnerConfirmed: false,
    step: 'awaiting_partner',
  },
  {
    id: 'ppc3',
    proposedAt: 'Mañana · 20:00',
    sortOrder: 3,
    club: 'Padel Center Resistencia',
    stake: '$15.000',
    challenger: p('me'),
    challengerPartner: p('p4'),
    challenged: p('p2'),
    challengedPartner: null,
    challengerPartnerConfirmed: true,
    step: 'awaiting_opponent_partner',
  },
  {
    id: 'ppc4',
    proposedAt: 'Sáb · 10:00',
    sortOrder: 4,
    club: 'Green Padel Club',
    stake: '$10.000',
    challenger: p('p6'),
    challengerPartner: p('p8'),
    challenged: p('me'),
    challengedPartner: null,
    challengerPartnerConfirmed: true,
    step: 'awaiting_opponent_partner',
  },
  {
    id: 'ppc5',
    proposedAt: 'Sáb · 12:30',
    sortOrder: 5,
    club: 'Top Padel CABA',
    stake: '$6.000',
    challenger: p('p7'),
    challengerPartner: p('me'),
    challenged: p('p2'),
    challengedPartner: null,
    challengerPartnerConfirmed: true,
    step: 'awaiting_opponent_partner',
  },
  {
    id: 'ppc6',
    proposedAt: 'Dom · 11:00',
    sortOrder: 6,
    club: 'Arena Padel Rosario',
    stake: '$9.000',
    challenger: p('p9'),
    challengerPartner: p('p4'),
    challenged: p('p5'),
    challengedPartner: null,
    challengerPartnerConfirmed: true,
    step: 'awaiting_opponent_partner',
  },
  {
    id: 'ppc7',
    proposedAt: 'Dom · 19:00',
    sortOrder: 7,
    club: 'Sunset Padel Bar',
    stake: '$20.000',
    challenger: p('p2'),
    challengerPartner: p('p10'),
    challenged: p('p11'),
    challengedPartner: p('p12'),
    challengerPartnerConfirmed: true,
    step: 'ready',
  },
  {
    id: 'ppc8',
    proposedAt: 'Lun · 18:00',
    sortOrder: 8,
    club: 'Córdoba Padel Arena',
    stake: '$7.500',
    challenger: p('p3'),
    challengerPartner: p('p9'),
    challenged: p('me'),
    challengedPartner: p('p6'),
    challengerPartnerConfirmed: true,
    step: 'ready',
  },
].sort((a, b) => a.sortOrder - b.sortOrder)

export function allPlayersInSimpleMatch(match: PendingSimpleMatch): Player[] {
  return [...match.teamA, ...match.teamB]
}

export function simpleMatchConfirmationCount(match: PendingSimpleMatch): number {
  return match.confirmations.filter((c) => c.confirmed).length
}

export function isSimpleMatchConfirmed(match: PendingSimpleMatch): boolean {
  return simpleMatchConfirmationCount(match) >= SIMPLE_MATCH_CONFIRMATIONS_REQUIRED
}

export function userInSimpleMatch(match: PendingSimpleMatch, userId: string): boolean {
  return allPlayersInSimpleMatch(match).some((player) => player.id === userId)
}

export function userConfirmedSimpleMatch(
  match: PendingSimpleMatch,
  userId: string,
): boolean {
  return match.confirmations.find((c) => c.playerId === userId)?.confirmed ?? false
}

export function pierdePagaTeamAverage(challenge: PendingPierdePagaChallenge): number {
  return Math.round(
    (challenge.challenger.rating + challenge.challengerPartner.rating) / 2,
  )
}

export type StatusTone = 'primary' | 'accent' | 'muted' | 'success' | 'warning'

export type ActivityStatus = {
  label: string
  detail?: string
  tone: StatusTone
}

export function getSimpleMatchStatus(
  match: PendingSimpleMatch,
  userId: string,
): ActivityStatus {
  const count = simpleMatchConfirmationCount(match)
  const confirmed = isSimpleMatchConfirmed(match)
  const involved = userInSimpleMatch(match, userId)
  const myConfirm = userConfirmedSimpleMatch(match, userId)
  const isLoader = match.loadedById === userId

  if (confirmed) {
    return {
      label: 'Confirmado',
      detail: `${count}/4 jugadores confirmaron`,
      tone: 'success',
    }
  }

  if (!involved) {
    return {
      label: 'Esperando confirmaciones',
      detail: `${count}/4 confirmaron`,
      tone: 'muted',
    }
  }

  if (!myConfirm) {
    return {
      label: 'Tu confirmación pendiente',
      detail: `Necesita ${SIMPLE_MATCH_CONFIRMATIONS_REQUIRED} de 4 · ${count}/4`,
      tone: 'warning',
    }
  }

  if (isLoader) {
    return {
      label: 'Confirmaste · esperando al resto',
      detail: `${count}/4 confirmaron`,
      tone: 'primary',
    }
  }

  return {
    label: 'Confirmaste · esperando al resto',
    detail: `${count}/4 confirmaron`,
    tone: 'primary',
  }
}

export function getPierdePagaChallengeStatus(
  challenge: PendingPierdePagaChallenge,
  userId: string,
): ActivityStatus {
  const avg = pierdePagaTeamAverage(challenge)
  const rangeLabel = `±${CHALLENGE_SKILL_RANGE} pts (prom. ${avg.toLocaleString('es-AR')})`

  const isChallenger = challenge.challenger.id === userId
  const isPartner = challenge.challengerPartner.id === userId
  const isChallenged = challenge.challenged.id === userId
  const isChallengedPartner = challenge.challengedPartner?.id === userId
  const involved =
    isChallenger || isPartner || isChallenged || isChallengedPartner

  if (challenge.step === 'ready') {
    return {
      label: 'Desafío confirmado',
      detail: challenge.challengedPartner
        ? `${challenge.challengedPartner.name.split(' ')[0]} sumó al equipo B`
        : undefined,
      tone: 'success',
    }
  }

  if (challenge.step === 'awaiting_partner') {
    if (isPartner && !challenge.challengerPartnerConfirmed) {
      return {
        label: 'Confirmá el desafío',
        detail: `${challenge.challenger.name.split(' ')[0]} te eligió de compañero`,
        tone: 'warning',
      }
    }
    if (isChallenger) {
      return {
        label: 'Esperando a tu compañero',
        detail: `Falta que ${challenge.challengerPartner.name.split(' ')[0]} confirme`,
        tone: 'accent',
      }
    }
    if (!involved) {
      return {
        label: 'Esperando compañero del desafiador',
        detail: `Falta ${challenge.challengerPartner.name.split(' ')[0]}`,
        tone: 'muted',
      }
    }
    return {
      label: 'Esperando compañero del desafiador',
      tone: 'muted',
    }
  }

  // awaiting_opponent_partner
  if (isChallenged) {
    return {
      label: 'Elegí tu compañero',
      detail: rangeLabel,
      tone: 'warning',
    }
  }
  if (isChallenger) {
    return {
      label: 'Esperando al rival',
      detail: `${challenge.challenged.name.split(' ')[0]} debe elegir compañero · ${rangeLabel}`,
      tone: 'accent',
    }
  }
  if (isPartner) {
    return {
      label: 'Compañero confirmado · esperando rival',
      detail: rangeLabel,
      tone: 'primary',
    }
  }
  if (!involved) {
    return {
      label: 'Esperando compañero del rival',
      detail: `${challenge.challenged.name.split(' ')[0]} debe elegir · ${rangeLabel}`,
      tone: 'muted',
    }
  }

  return {
    label: 'En curso',
    tone: 'muted',
  }
}

export function simpleMatchActions(
  match: PendingSimpleMatch,
  userId: string,
): { canConfirm: boolean; canCancel: boolean } {
  const involved = userInSimpleMatch(match, userId)
  const myConfirm = userConfirmedSimpleMatch(match, userId)
  const confirmed = isSimpleMatchConfirmed(match)
  const isLoader = match.loadedById === userId

  return {
    canConfirm: involved && !myConfirm && !confirmed,
    canCancel: isLoader && !confirmed,
  }
}

export function pierdePagaChallengeActions(
  challenge: PendingPierdePagaChallenge,
  userId: string,
): {
  canConfirmPartner: boolean
  canPickPartner: boolean
  canCancel: boolean
} {
  const isChallenger = challenge.challenger.id === userId
  const isPartner = challenge.challengerPartner.id === userId
  const isChallenged = challenge.challenged.id === userId

  return {
    canConfirmPartner:
      isPartner &&
      challenge.step === 'awaiting_partner' &&
      !challenge.challengerPartnerConfirmed,
    canPickPartner:
      isChallenged &&
      challenge.step === 'awaiting_opponent_partner' &&
      !challenge.challengedPartner,
    canCancel:
      isChallenger &&
      challenge.step !== 'ready',
  }
}

export const statusToneClasses: Record<StatusTone, string> = {
  primary: 'bg-primary/10 text-primary border-primary/25',
  accent: 'bg-accent/10 text-accent border-accent/25',
  muted: 'bg-secondary/40 text-muted-foreground border-border',
  success: 'bg-primary/10 text-primary border-primary/30',
  warning: 'bg-accent/15 text-accent border-accent/35',
}
