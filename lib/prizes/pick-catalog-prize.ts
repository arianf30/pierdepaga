import type { SponsorPrizeSubmission } from '@/lib/types/account'

function pickBestMatch(
  matches: SponsorPrizeSubmission[],
): SponsorPrizeSubmission | undefined {
  if (matches.length === 0) return undefined
  return (
    matches.find((item) => item.status === 'approved') ??
    matches.find((item) => item.status === 'pending')
  )
}

export function pickRankingCatalogPrize(
  prizes: SponsorPrizeSubmission[],
  position: number,
): SponsorPrizeSubmission | undefined {
  return pickBestMatch(
    prizes.filter(
      (item) =>
        item.prize_type === 'ranking' && item.ranking_position === position,
    ),
  )
}

export function pickStreakCatalogPrize(
  prizes: SponsorPrizeSubmission[],
  milestone: number,
): SponsorPrizeSubmission | undefined {
  return pickBestMatch(
    prizes.filter(
      (item) =>
        item.prize_type === 'streak' && item.streak_milestone === milestone,
    ),
  )
}

export function hasVisibleCatalogPrizes(
  prizes: SponsorPrizeSubmission[],
): boolean {
  return prizes.some(
    (item) => item.status === 'approved' || item.status === 'pending',
  )
}
