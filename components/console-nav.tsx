'use client'

import { motion } from 'framer-motion'
import {
  Home,
  Trophy,
  Medal,
  Swords,
  Sparkles,
  Bell,
  LogOut,
} from 'lucide-react'
import type { View } from '@/lib/data'
import { cn } from '@/lib/utils'
import { useUser } from '@/components/auth/user-provider'
import { getInitials } from '@/lib/auth/user'
import {
  BackdropBlur,
  MobilePortal,
  useIsLg,
} from '@/components/bar-backdrop'
import { BrandLogo } from '@/components/brand-logo'
import { RegionSelectors } from '@/components/region-selectors'

const items: { id: View; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Arena', icon: Home },
  { id: 'ranking', label: 'Ranking', icon: Trophy },
  { id: 'prizes', label: 'Premios', icon: Medal },
  { id: 'challenges', label: 'Desafíos', icon: Swords },
  { id: 'soon', label: 'Expansiones', icon: Sparkles },
]

export function ConsoleNav({
  view,
  setView,
}: {
  view: View
  setView: (v: View) => void
}) {
  const { signOut } = useUser()

  return (
    <>
      {/* Desktop rail */}
      <nav className="fixed left-0 top-0 z-40 hidden h-screen w-20 flex-col items-center justify-between border-r border-border glass py-6 lg:flex">
        <button
          onClick={() => setView('home')}
          className="grid size-14 place-items-center transition-transform hover:scale-105"
          aria-label="Inicio PierdePaga"
        >
          <BrandLogo size="xl" variant="compact" />
        </button>

        <div className="flex flex-col items-center gap-2">
          {items.map((item) => {
            const active = view === item.id
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
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
              </button>
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
              const active = view === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={cn(
                    'flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium uppercase tracking-wide transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <item.icon className="size-5" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </nav>
      </MobilePortal>
    </>
  )
}

function TopBarContent({
  onBell,
  onProfile,
  isProfile,
  isNotifications,
}: {
  onBell?: () => void
  onProfile?: () => void
  isProfile?: boolean
  isNotifications?: boolean
}) {
  const { player } = useUser()

  return (
    <div className="relative z-1 flex items-center justify-between gap-4 px-4 py-3 lg:px-8">
      <RegionSelectors />

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          onClick={onBell}
          className={cn(
            'relative grid size-9 place-items-center rounded-lg border transition-colors',
            isNotifications
              ? 'border-primary/40 bg-primary/10 text-primary ring-1 ring-primary/25'
              : 'border-border bg-secondary/60 text-muted-foreground hover:text-foreground',
          )}
          aria-label="Notificaciones"
          aria-current={isNotifications ? 'page' : undefined}
        >
          <Bell className="size-4" />
          <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-destructive ring-2 ring-background" />
        </button>
        <button
          type="button"
          onClick={onProfile}
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
            {getInitials(player.name)}
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-xs font-semibold">{player.name}</p>
            <p className="type-tag text-[10px]">{player.tier}</p>
          </div>
        </button>
      </div>
    </div>
  )
}

export function TopBar({
  onBell,
  onProfile,
  isProfile,
  isNotifications,
}: {
  onBell?: () => void
  onProfile?: () => void
  isProfile?: boolean
  isNotifications?: boolean
}) {
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
      <TopBarContent
        onBell={onBell}
        onProfile={onProfile}
        isProfile={isProfile}
        isNotifications={isNotifications}
      />
    </header>
  )

  return (
    <MobilePortal enabled={usePortal}>{header}</MobilePortal>
  )
}
