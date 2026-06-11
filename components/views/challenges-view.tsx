'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CirclePlus, Calculator, Swords } from 'lucide-react'
import {
  AccentButton,
  GhostButton,
  PrimaryButton,
  SectionTitle,
  fadeUp,
} from '@/components/ui-kit'
import { useUser } from '@/components/auth/user-provider'
import { LoadMatchModal } from '@/components/challenges/load-match-modal'
import { SkillPointsCalculatorModal } from '@/components/challenges/skill-points-calculator-modal'
import { PierdePagaChallengeModal } from '@/components/challenges/pierde-paga-challenge-modal'
import { PendingPierdePagaCard } from '@/components/challenges/pending-pierde-paga-card'
import { PendingPartidoCard } from '@/components/challenges/pending-partido-card'
import { usePendingPartidos } from '@/hooks/use-pending-partidos'
import { getPlayerById, searchChallengeOpponents } from '@/lib/data'
import {
  pendingPierdePagaChallenges,
  pierdePagaTeamAverage,
  type PendingPierdePagaChallenge,
} from '@/lib/pending-activities'

export function ChallengesView() {
  const { player } = useUser()
  const {
    partidos: pendingPartidos,
    loading: partidosLoading,
    refresh: refreshPartidos,
  } = usePendingPartidos()
  const [loadMatchOpen, setLoadMatchOpen] = useState(false)
  const [calculatorOpen, setCalculatorOpen] = useState(false)
  const [pierdePagaOpen, setPierdePagaOpen] = useState(false)
  const [challenges, setChallenges] = useState(pendingPierdePagaChallenges)

  async function handleConfirmPartido(id: string) {
    const response = await fetch(`/api/partidos/${id}/confirm`, {
      method: 'POST',
      credentials: 'include',
    })
    const body = (await response.json()) as { error?: string }
    if (!response.ok) {
      throw new Error(body.error ?? 'No se pudo confirmar el partido')
    }
    await refreshPartidos()
  }

  const sortedChallenges = useMemo(
    () => [...challenges].sort((a, b) => a.sortOrder - b.sortOrder),
    [challenges],
  )

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

  function handleLoadMatchSuccess() {
    setLoadMatchOpen(false)
    void refreshPartidos()
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
            <CirclePlus className="size-4" />
            Cargar partido
          </PrimaryButton>
          <AccentButton onClick={() => setPierdePagaOpen(true)}>
            <Swords className="size-4" />
            Desafío pierde paga
          </AccentButton>
          <GhostButton onClick={() => setCalculatorOpen(true)}>
            <Calculator className="size-4" />
            Calculadora de puntos
          </GhostButton>
        </motion.div>
      </motion.div>

      <motion.section {...fadeUp(2)}>
        <SectionTitle kicker="Pendientes" title="Partidos por confirmar" />
        {partidosLoading ? (
          <p className="text-sm text-muted-foreground">Cargando partidos…</p>
        ) : pendingPartidos.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card/40 px-5 py-8 text-sm text-muted-foreground">
            No tenés partidos pendientes de confirmación.
          </p>
        ) : (
          <div className="space-y-4">
            {pendingPartidos.map((partido, i) => (
              <motion.div key={partido.id} {...fadeUp(i + 3)}>
                <PendingPartidoCard
                  partido={partido}
                  onConfirm={handleConfirmPartido}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      <motion.section {...fadeUp(3)}>
        <SectionTitle kicker="Pierde paga" title="Desafíos en curso" />
        {sortedChallenges.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card/40 px-5 py-8 text-sm text-muted-foreground">
            No hay desafíos pierde paga activos.
          </p>
        ) : (
          <div className="space-y-4">
            {sortedChallenges.map((challenge: PendingPierdePagaChallenge, i) => (
              <motion.div key={challenge.id} {...fadeUp(i + 4)}>
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
        onSuccess={handleLoadMatchSuccess}
      />
      <SkillPointsCalculatorModal
        open={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />
      <PierdePagaChallengeModal
        open={pierdePagaOpen}
        onClose={() => setPierdePagaOpen(false)}
      />
    </div>
  )
}
