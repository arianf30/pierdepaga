import type { Metadata } from 'next'
import { ArchivePage } from '@/components/archive/archive-page'

export const metadata: Metadata = {
  title: 'Archivo — PierdePaga',
  description:
    'Copia de seguridad de componentes y estilos retirados de las pantallas activas.',
}

export default function ArchivoPage() {
  return <ArchivePage />
}
