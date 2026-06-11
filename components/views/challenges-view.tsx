'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CirclePlus, Swords } from 'lucide-react'
import {
  AccentButton,
  PrimaryButton,
  SectionTitle,
  fadeUp,
} from '@/components/ui-kit'
import { useUser } from '@/components/auth/user-provider'
import { LoadMatchModal } from '@/components/challenges/load-match-modal'
import { PierdePagaChallengeModal } from '@/components/challenges/pierde-paga-challenge-modal'
import { PendingPierdePagaCard } from '@/components/challenges/pending-pierde-paga-card'
import { PendingSimpleMatchCard } from '@/components/challenges/pending-simple-match-card'
import { getPlayerById, searchChallengeOpponents } from '@/lib/data'
import {
  pendingPierdePagaChallenges,
  pendingSimpleMatches,
  pierdePagaTeamAverage,
  type PendingPierdePagaChallenge,
  type PendingSimpleMatch,
} from '@/lib/pending-activities'

export function ChallengesView() {
  const { player } = useUser()
  const [loadMatchOpen, setLoadMatchOpen] = useState(false)
  const [pierdePagaOpen, setPierdePagaOpen] = useState(false)
  const [simpleMatches, setSimpleMatches] = useState(pendingSimpleMatches)
  const [challenges, setChallenges] = useState(pendingPierdePagaChallenges)

  const sortedSimpleMatches = useMemo(
    () => [...simpleMatches].sort((a, b) => a.sortOrder - b.sortOrder),
    [simpleMatches],
  )

  const sortedChallenges = useMemo(
    () => [...challenges].sort((a, b) => a.sortOrder - b.sortOrder),
    [challenges],
  )

  function handleConfirmSimpleMatch(id: string) {
    setSimpleMatches((prev) =>
      prev.map((match) => {
        if (match.id !== id) return match
        return {
          ...match,
          confirmations: match.confirmations.map((c) =>
            c.playerId === player.id ? { ...c, confirmed: true } : c,
          ),
        }
      }),
    )
  }

  function handleCancelSimpleMatch(id: string) {
    setSimpleMatches((prev) => prev.filter((match) => match.id !== id))
  }

  function handleConfirmChallengePartner(id: string) {
    setChallenges((prev) =>
      prev.map((challenge) => {
        if (challenge.id !== id) return challenge
        return {
          ...challenge,
          challengerPartnerConfirmed: true,
          step: 'awaiting_opponent_partner' as const,
        }
      }),
    )
  }

  function handlePickChallengePartner(id: string) {
    const challenge = challenges.find((c) => c.id === id)
    if (!challenge) return

    const avg = pierdePagaTeamAverage(challenge)
    const candidates = searchChallengeOpponents('', avg, {
      excludeIds: [
        challenge.challenger.id,
        challenge.challengerPartner.id,
        challenge.challenged.id,
        player.id,
      ],
      limit: 1,
    })
    const partner = candidates[0] ?? getPlayerById('p6')
    if (!partner) return

    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        return {
          ...c,
          challengedPartner: partner,
          step: 'ready' as const,
        }
      }),
    )
  }

  function handleCancelChallenge(id: string) {
    setChallenges((prev) => prev.filter((challenge) => challenge.id !== id))
  }

  return (
    <div className="space-y-10 pb-10">
      <motion.div {...fadeUp(0)}>
        <p className="type-kicker">Desafíos</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight lg:text-4xl">
          Desafíos
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Cargá partidos simples, proponé desafíos pierde paga y seguí el estado
          de cada confirmación pendiente.
        </p>

        <motion.div {...fadeUp(1)} className="mt-6 flex flex-wrap gap-3">
          <PrimaryButton onClick={() => setLoadMatchOpen(true)}>
            <CirclePlus className="size-4" /> Partido Simple
          </PrimaryButton>
          <AccentButton onClick={() => setPierdePagaOpen(true)}>
            <Swords className="size-4" /> Pierde Paga
          </AccentButton>
        </motion.div>
      </motion.div>

      <motion.section {...fadeUp(2)}>
        <SectionTitle
          title="Partidos cargados"
          kicker="Partido simple"
        />
        <p className="-mt-2 mb-4 text-xs text-muted-foreground">
          Resultados cargados que necesitan al menos 3 de 4 confirmaciones para
          publicarse.
        </p>
        {sortedSimpleMatches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/30 px-5 py-8 text-center text-sm text-muted-foreground">
            No hay partidos pendientes de confirmación.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedSimpleMatches.map((match: PendingSimpleMatch, i) => (
              <motion.div key={match.id} {...fadeUp(i + 1)}>
                <PendingSimpleMatchCard
                  match={match}
                  userId={player.id}
                  onConfirm={handleConfirmSimpleMatch}
                  onCancel={handleCancelSimpleMatch}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      <motion.section {...fadeUp(3)}>
        <SectionTitle
          title="Desafíos pendientes"
          kicker="Pierde paga"
        />
        <p className="-mt-2 mb-4 text-xs text-muted-foreground">
          Primero confirma el compañero del desafiador; después el rival elige
          compañero dentro de ±200 pts del promedio del equipo A.
        </p>
        {sortedChallenges.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/30 px-5 py-8 text-center text-sm text-muted-foreground">
            No hay desafíos pendientes.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedChallenges.map((challenge: PendingPierdePagaChallenge, i) => (
              <motion.div key={challenge.id} {...fadeUp(i + 1)}>
                <PendingPierdePagaCard
                  challenge={challenge}
                  userId={player.id}
                  onConfirmPartner={handleConfirmChallengePartner}
                  onPickPartner={handlePickChallengePartner}
                  onCancel={handleCancelChallenge}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      <LoadMatchModal
        open={loadMatchOpen}
        onClose={() => setLoadMatchOpen(false)}
      />
      <PierdePagaChallengeModal
        open={pierdePagaOpen}
        onClose={() => setPierdePagaOpen(false)}
      />
    </div>
  )
}
