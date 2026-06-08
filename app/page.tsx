'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { View } from '@/lib/data'
import { Atmosphere } from '@/components/atmosphere'
import { ConsoleNav, TopBar } from '@/components/console-nav'
import { HomeView } from '@/components/views/home-view'
import { RankingView } from '@/components/views/ranking-view'
import { ProfileView } from '@/components/views/profile-view'
import { ChallengesView } from '@/components/views/challenges-view'
import { ComingSoonView } from '@/components/views/coming-soon-view'
import { UserProvider } from '@/components/auth/user-provider'

export default function Page() {
  const [view, setView] = useState<View>('home')

  return (
    <UserProvider>
      <div className="relative min-h-screen">
        <Atmosphere />

        <ConsoleNav view={view} setView={setView} />
        <TopBar onBell={() => setView('home')} />

        <div className="relative lg:pl-20">
          <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-[4.25rem] sm:px-6 lg:px-10 lg:pb-10 lg:pt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {view === 'home' && <HomeView setView={setView} />}
                {view === 'ranking' && <RankingView setView={setView} />}
                {view === 'profile' && <ProfileView />}
                {view === 'challenges' && <ChallengesView />}
                {view === 'soon' && <ComingSoonView />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </UserProvider>
  )
}
