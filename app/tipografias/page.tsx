import {
  Arimo,
  Archivo,
  Bebas_Neue,
  Bricolage_Grotesque,
  Jost,
  Manrope,
  Saira,
} from 'next/font/google'
import { FontPreviewPage } from '@/components/fonts-preview/font-preview-page'
import { FONT_PREVIEW_OPTIONS } from '@/lib/fonts/preview-catalog'
import { iosevkaCharonPreview } from '@/lib/fonts/iosevka-charon-preview'

const arimo = Arimo({
  variable: '--font-p-arimo',
  subsets: ['latin'],
  weight: ['600', '700'],
})

const manrope = Manrope({
  variable: '--font-p-manrope',
  subsets: ['latin'],
  weight: ['600', '700'],
})

const bebasNeue = Bebas_Neue({
  variable: '--font-p-bebas-neue',
  subsets: ['latin'],
  weight: ['400'],
})

const saira = Saira({
  variable: '--font-p-saira',
  subsets: ['latin'],
  weight: ['600', '700'],
})

const bricolage = Bricolage_Grotesque({
  variable: '--font-p-bricolage',
  subsets: ['latin'],
  weight: ['600', '700'],
})

const jost = Jost({
  variable: '--font-p-jost',
  subsets: ['latin'],
  weight: ['600', '700'],
})

const archivo = Archivo({
  variable: '--font-p-archivo',
  subsets: ['latin'],
  weight: ['600', '700'],
})

const fontVariables = [
  arimo.variable,
  iosevkaCharonPreview.variable,
  manrope.variable,
  bebasNeue.variable,
  saira.variable,
  bricolage.variable,
  jost.variable,
  archivo.variable,
].join(' ')

export const metadata = {
  title: 'Tipografías — PierdePaga',
  description: 'Preview temporal de fuentes para títulos y logo.',
}

export default function TipografiasPage() {
  return (
    <div className={fontVariables}>
      <FontPreviewPage options={FONT_PREVIEW_OPTIONS} />
    </div>
  )
}
