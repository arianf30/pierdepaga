'use client'

import { Atmosphere } from '@/components/atmosphere'
import { ConsoleNav, TopBar } from '@/components/console-nav'
import { RegionProvider } from '@/components/region-provider'
import { SportProvider } from '@/components/sport-provider'
import { UserProvider } from '@/components/auth/user-provider'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <RegionProvider>
      <SportProvider>
        <UserProvider>
          <div className="relative min-h-screen">
            <Atmosphere />
            <ConsoleNav />
            <TopBar />
            <div className="relative lg:pl-20">
              <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-[5.5rem] sm:px-6 lg:px-10 lg:pb-10 lg:pt-6">
                {children}
              </main>
            </div>
          </div>
        </UserProvider>
      </SportProvider>
    </RegionProvider>
  )
}
