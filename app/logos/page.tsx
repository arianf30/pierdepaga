import type { Metadata } from 'next'
import {
  Syne,
  Space_Grotesk,
  Barlow_Condensed,
  Sora,
  Barlow,
} from 'next/font/google'
import { LogoProposalsPage } from '@/components/logo-proposals/logo-proposals-page'

const syne = Syne({
  variable: '--logo-luxury',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

const spaceGrotesk = Space_Grotesk({
  variable: '--logo-tech',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const barlowCondensed = Barlow_Condensed({
  variable: '--logo-league',
  subsets: ['latin'],
  weight: ['600', '700'],
})

const sora = Sora({
  variable: '--logo-playstation',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
})

const barlow = Barlow({
  variable: '--logo-formula',
  subsets: ['latin'],
  weight: ['600', '700'],
  style: ['italic', 'normal'],
})

export const metadata: Metadata = {
  title: 'Propuestas tipográficas — PierdePaga',
  description:
    'Exploración de wordmarks premium para PierdePaga. Cinco direcciones tipográficas sin símbolos.',
}

export default function LogosPage() {
  return (
    <div
      className={`${syne.variable} ${spaceGrotesk.variable} ${barlowCondensed.variable} ${sora.variable} ${barlow.variable}`}
    >
      <LogoProposalsPage />
    </div>
  )
}
