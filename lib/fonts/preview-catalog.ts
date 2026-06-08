export type FontPreviewOption = {
  id: string
  name: string
  variable: string
  vibe: string
  bestFor: string
}

/** Fuentes en evaluación para logo + títulos (cuerpo sigue en Inter) */
export const FONT_PREVIEW_OPTIONS: FontPreviewOption[] = [
  {
    id: 'arimo',
    name: 'Arimo',
    variable: '--font-p-arimo',
    vibe: 'Sans clásica y neutra, hermana de Arial pero más pulida.',
    bestFor: 'Títulos sobrios y muy legibles.',
  },
  {
    id: 'iosevka-charon',
    name: 'Iosevka Charon',
    variable: '--font-p-iosevka-charon',
    vibe: 'Técnica y precisa, aire de UI densa y moderna.',
    bestFor: 'Marca con carácter tech sin exagerar.',
  },
  {
    id: 'manrope',
    name: 'Manrope',
    variable: '--font-p-manrope',
    vibe: 'Contemporánea y equilibrada, amigable al ojo.',
    bestFor: 'UI deportiva moderna y accesible.',
  },
  {
    id: 'bebas-neue',
    name: 'Bebas Neue',
    variable: '--font-p-bebas-neue',
    vibe: 'Display condensada, impacto de cartel deportivo.',
    bestFor: 'Logo y headlines con mucha presencia.',
  },
  {
    id: 'saira',
    name: 'Saira',
    variable: '--font-p-saira',
    vibe: 'Geométrica con energía, familia muy versátil.',
    bestFor: 'Títulos con personalidad deportiva moderada.',
  },
  {
    id: 'bricolage',
    name: 'Bricolage Grotesque',
    variable: '--font-p-bricolage',
    vibe: 'Grotesk expresiva, moderna y con carácter.',
    bestFor: 'Marca distintiva sin volver al gaming.',
  },
  {
    id: 'jost',
    name: 'Jost',
    variable: '--font-p-jost',
    vibe: 'Geométrica inspirada en Futura, limpia y actual.',
    bestFor: 'Títulos premium y minimalistas.',
  },
  {
    id: 'archivo',
    name: 'Archivo',
    variable: '--font-p-archivo',
    vibe: 'Condensada y contundente, buen impacto.',
    bestFor: 'Headlines con presencia y fuerza.',
  },
]
