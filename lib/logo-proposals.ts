export type LogoConceptId =
  | 'luxury'
  | 'technology'
  | 'league'
  | 'playstation'
  | 'formula'

export type LogoConcept = {
  id: LogoConceptId
  number: 1 | 2 | 3 | 4 | 5
  title: string
  subtitle: string
  fontVar: string
  fontLabel: string
  accent: string
  accentLabel: string
  rationale: string[]
  keywords: string[]
}

export const LOGO_CONCEPTS: LogoConcept[] = [
  {
    id: 'luxury',
    number: 1,
    title: 'Meridian',
    subtitle: 'Luxury Sports Brand',
    fontVar: '--logo-luxury',
    fontLabel: 'Syne',
    accent: '#C4A574',
    accentLabel: 'Champagne',
    keywords: ['Prestigio', 'Espaciado', 'Status', 'Elegancia'],
    rationale: [
      'Wordmark apilado con tracking extremo en PIERDE y PAGA como declaración de peso visual. Referencia Porsche y marcas de relojería deportiva.',
      'La jerarquía tipográfica comunica ascenso: lo superior es el contexto, lo inferior es la consecuencia.',
      'Sin adornos. La calidad está en el ritmo, el espacio negativo y el contraste de pesos.',
    ],
  },
  {
    id: 'technology',
    number: 2,
    title: 'Continuum',
    subtitle: 'Premium Technology Company',
    fontVar: '--logo-tech',
    fontLabel: 'Space Grotesk',
    accent: '#5B8DEF',
    accentLabel: 'Signal Blue',
    keywords: ['Precisión', 'Sistema', 'Progresión', 'Claridad'],
    rationale: [
      'Una sola línea con transición de peso en el límite silábico — la tipografía misma marca dónde termina el juego y empieza el pago.',
      'Kerning manual entre letras críticas (P–i, e–P) para ritmo geométrico de marca tech global.',
      'Estética Riot/Netflix: confiada, limpia, sin gritar. Funciona en dashboards y keynotes.',
    ],
  },
  {
    id: 'league',
    number: 3,
    title: 'Grand Prix',
    subtitle: 'Global Competitive League',
    fontVar: '--logo-league',
    fontLabel: 'Barlow Condensed',
    accent: '#00E676',
    accentLabel: 'Victory Green',
    keywords: ['Liga', 'Escala', 'Impacto', 'Campeonato'],
    rationale: [
      'Condensada y en mayúsculas para máxima legibilidad en banners de estadio y transmisiones.',
      'El punto central como único separador tipográfico — puntuación, no símbolo.',
      'Pensada para EA Sports FC y circuitos internacionales: se lee a 50 metros.',
    ],
  },
  {
    id: 'playstation',
    number: 4,
    title: 'Studios',
    subtitle: 'PlayStation Studios Aesthetic',
    fontVar: '--logo-playstation',
    fontLabel: 'Sora',
    accent: '#FAFAFA',
    accentLabel: 'Pure White',
    keywords: ['Minimal', 'Confianza', 'Entretenimiento', 'Global'],
    rationale: [
      'Minúsculas continuas al estudio PlayStation/Netflix: una palabra, dos intenciones mediante contraste de opacidad.',
      'Geometría redondeada y proporciones equilibradas — premium gaming sin estética esports.',
      'El wordmark es el icono. Escala perfecto en splash screens y packaging.',
    ],
  },
  {
    id: 'formula',
    number: 5,
    title: 'Velocity',
    subtitle: 'Formula 1 Inspired Branding',
    fontVar: '--logo-formula',
    fontLabel: 'Barlow',
    accent: '#FF3B30',
    accentLabel: 'Racing Red',
    keywords: ['Velocidad', 'Rivalidad', 'Itálica', 'Precisión'],
    rationale: [
      'Itálica condensada con regla horizontal tipográfica — la línea de meta como elemento de texto, no gráfico.',
      'Inclinación controlada sugiere movimiento y competencia sin agresividad excesiva.',
      'Inspiración F1: sponsors corporativos, cobertura broadcast, merchandising de liga.',
    ],
  },
]
