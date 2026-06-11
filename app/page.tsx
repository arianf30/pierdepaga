import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing/landing-page'

export const metadata: Metadata = {
  title: 'PierdePaga — El que pierde, paga',
  description:
    'Pádel competitivo gratis por premios. Ranking por provincia, desafíos pierde paga y partidos simples en canchas reales. Competí y hacé que tu rival pague.',
}

export default function LandingRoute() {
  return <LandingPage />
}
