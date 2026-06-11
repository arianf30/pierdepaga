import type { AnnualRankingPrize, StreakCatalogPrize } from '@/lib/data'
import type { SponsorPrizeSubmission } from '@/lib/types/account'

function mapStatus(
  submission: SponsorPrizeSubmission,
): 'pending' | 'approved' | undefined {
  if (submission.status === 'pending' || submission.status === 'approved') {
    return submission.status
  }
  return undefined
}

export function mapSubmissionToAnnualPrize(
  submission: SponsorPrizeSubmission,
): AnnualRankingPrize {
  return {
    id: submission.id,
    position: submission.ranking_position ?? 1,
    title: submission.title,
    sponsor: submission.sponsor_brand,
    image: submission.image_url ?? undefined,
    detail: submission.detail || undefined,
    status: mapStatus(submission),
  }
}

export function mapSubmissionToStreakPrize(
  submission: SponsorPrizeSubmission,
): StreakCatalogPrize {
  return {
    id: submission.id,
    milestone: submission.streak_milestone ?? 0,
    title: submission.title,
    sponsor: submission.sponsor_brand,
    image: submission.image_url ?? undefined,
    detail: submission.detail || undefined,
    deliveredCount: submission.delivered_count,
    status: mapStatus(submission),
  }
}
