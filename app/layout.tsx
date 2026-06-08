import type React from 'react'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Archivo, Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

/** Títulos y logo */
const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'PierdePaga — El que pierde, paga',
  description:
    'Entrá a la cancha. Desafiá rivales, subí en el ranking y demostrá tu nivel en el ecosistema premium de pádel competitivo. Cada partido tiene consecuencias.',
}

export const viewport = {
  themeColor: '#0a0e14',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es-AR"
      className={`dark ${inter.variable} ${archivo.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
