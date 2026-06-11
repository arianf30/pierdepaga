'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  Trophy,
  Medal,
  Swords,
  LogOut,
} from 'lucide-react'
import { isNavActive, isProfileActive, routes } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { useUser } from '@/components/auth/user-provider'
import { getInitials } from '@/lib/auth/user'
import {
  BackdropBlur,
  MobilePortal,
  useIsLg,
} from '@/components/bar-backdrop'
import { BrandLogo } from '@/components/brand-logo'
import { playerPublicName } from '@/lib/player-names'
import { RegionSelectors } from '@/components/region-selectors'

const items = [
  { href: routes.home, label: 'Inicio', icon: Home },
  { href: routes.ranking, label: 'Ranking', icon: Trophy },
  { href: routes.prizes, label: 'Premios', icon: Medal },
  { href: routes.challenges, label: 'Desafíos', icon: Swords },
] as const

export function ConsoleNav() {
  const pathname = usePathname()
  const { signOut } = useUser()

  return (
    <>
      {/* Desktop rail */}
      <nav className="fixed left-0 top-0 z-40 hidden h-screen w-20 flex-col items-center justify-between border-r border-border glass py-6 lg:flex">
        <Link
          href={routes.home}
          className="grid size-14 place-items-center transition-transform hover:scale-105"
          aria-label="Inicio"
        >
          <BrandLogo size="xl" variant="compact" />
        </Link>

        <div className="flex flex-col items-center gap-2">
          {items.map((item) => {
            const active = isNavActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative grid size-12 place-items-center rounded-xl transition-colors',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-xl border border-primary/40 bg-primary/10 ring-glow-energy"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <item.icon className="relative size-5" strokeWidth={2} />
                <span className="pointer-events-none absolute left-16 z-50 whitespace-nowrap rounded-md border border-border bg-popover px-2.5 py-1 text-xs font-medium opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => signOut()}
            className="grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:text-destructive"
            aria-label="Cerrar sesión"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </nav>

      {/* Mobile bottom bar — portal al body para que backdrop-filter funcione */}
      <MobilePortal enabled>
        <nav className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
          <BackdropBlur edge="bottom" />
          <div className="relative z-1 flex items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {items.map((item) => {
              const active = isNavActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium uppercase tracking-wide transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <item.icon className="size-5" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>
      </MobilePortal>
    </>
  )
}

function TopBarContent() {
  const pathname = usePathname()
  const { player, signOut } = useUser()
  const isProfile = isProfileActive(pathname)

  return (
    <div className="relative z-1 flex items-center justify-between gap-4 px-4 py-3 lg:px-8">
      <RegionSelectors />

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Link
          href={routes.profile}
          className={cn(
            'flex items-center gap-2 rounded-lg border py-1 pl-1 pr-3 transition-colors',
            isProfile
              ? 'border-primary/40 bg-primary/10 ring-1 ring-primary/25'
              : 'border-border bg-secondary/60 hover:border-primary/30 hover:bg-secondary/80',
          )}
          aria-label="Ir al perfil"
          aria-current={isProfile ? 'page' : undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={player.avatar}
            alt=""
            className="size-7 rounded-md object-cover"
          />
          <span className="font-display text-xs font-bold uppercase tracking-wide text-foreground sm:hidden">
            {getInitials(playerPublicName(player))}
          </span>
          <span className="hidden text-xs font-semibold sm:inline">
            {playerPublicName(player)}
          </span>
        </Link>
        <button
          type="button"
          onClick={() => signOut()}
          className="grid size-9 place-items-center rounded-lg border border-border bg-secondary/60 text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
          aria-label="Cerrar sesión"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function TopBar() {
  const isLg = useIsLg()
  const usePortal = isLg === false

  const header = (
    <header
      className={cn(
        'relative z-40',
        usePortal || isLg === null
          ? 'fixed inset-x-0 top-0'
          : 'sticky top-0 lg:ml-20',
      )}
    >
      <BackdropBlur edge="top" />
      <TopBarContent />
    </header>
  )

  return (
    <MobilePortal enabled={usePortal}>{header}</MobilePortal>
  )
}
