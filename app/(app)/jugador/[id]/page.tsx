import { PlayerProfileView } from '@/components/views/player-profile-view'

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PlayerProfileView playerId={id} />
}
