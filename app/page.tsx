'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'

const CTAButton = dynamic(() => import('@/components/CTAButton'), {
  ssr: false,
})

function CodeHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      const next = searchParams.get('next') || '/reset-password'
      window.location.href = `/auth/callback?code=${code}&next=${encodeURIComponent(next)}`
    }
  }, [searchParams])

  return null
}

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <CodeHandler />
      </Suspense>

      <div
        className="min-h-screen w-full bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/bgImage.png')" }}
      >
        <main className="flex flex-col items-center px-4 pb-16 sm:pb-24">

          {/* Hero */}
          <section className="w-full max-w-3xl text-center pt-16 sm:pt-24 pb-12">
            <h1
              className="text-4xl sm:text-5xl md:text-[64px] font-semibold leading-tight md:leading-[80px] text-center"
              style={{ letterSpacing: '-2px' }}
            >
              <span className="text-[#0F172B]">Steer yourself toward </span>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                better friendships
              </span>
            </h1>
            <p
              className="mt-5 text-lg sm:text-2xl font-medium text-center text-[#45556C]"
              style={{ letterSpacing: '1.3px' }}
            >
              Clarify and navigate your real friendships.
            </p>
            <p
              className="mt-3 text-sm sm:text-base font-normal text-center text-[#62748E] max-w-[420px] mx-auto"
              style={{ letterSpacing: '-0.312px' }}
            >
              Private and secure — a place to reflect on where to invest your energy.
            </p>
            <div className="mt-10">
              <CTAButton text="Try FriendLens" variant="primary" href="/friendlens/start-here" />
            </div>
          </section>

          {/* How It Works */}
          <section className="w-full max-w-3xl mb-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 sm:p-10">
              <h2
                className="text-xl sm:text-2xl font-semibold text-center text-[#0F172B] mb-8"
                style={{ letterSpacing: '-0.5px' }}
              >
                How It Works
              </h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  {
                    num: '1',
                    title: 'Understand your style, people, and constraints',
                    desc: 'Add people and events. See patterns over time.',
                    color: 'text-indigo-600',
                    bg: 'bg-indigo-50',
                  },
                  {
                    num: '2',
                    title: 'Notice role and initiative',
                    desc: 'See how hosting and invitations are actually working.',
                    color: 'text-purple-600',
                    bg: 'bg-purple-50',
                  },
                  {
                    num: '3',
                    title: 'Reflect with clarity, not noise',
                    desc: 'No feeds. No algorithms. No social pressure.',
                    color: 'text-pink-600',
                    bg: 'bg-pink-50',
                  },
                ].map((step) => (
                  <div key={step.num} className="flex flex-col items-center text-center p-4">
                    <div
                      className={`w-12 h-12 ${step.bg} rounded-xl flex items-center justify-center mb-3`}
                    >
                      <span className={`text-lg font-bold ${step.color}`}>{step.num}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#0F172B] mb-1 leading-snug">{step.title}</h3>
                    <p className="text-xs text-[#62748E] leading-5">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Why It Matters */}
          <section className="w-full max-w-3xl mb-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 sm:p-10 text-center">
              <h2
                className="text-xl sm:text-2xl font-semibold text-[#0F172B] mb-6"
                style={{ letterSpacing: '-0.5px' }}
              >
                Why It Matters
              </h2>
              <p className="text-base sm:text-lg text-[#45556C] leading-relaxed">
                Friendship often becomes harder in adulthood.
                <br />
                Busy calendars. Uneven signals. Drift that never gets named.
              </p>
              <p className="mt-4 text-base sm:text-lg text-[#45556C] leading-relaxed">
                FriendLens makes these patterns legible —
                <br />
                so you can make grounded decisions about what will work.
              </p>
            </div>
          </section>

          {/* Field-tested */}
          <section className="w-full max-w-3xl">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 sm:p-10 text-center">
              <h2
                className="text-xl sm:text-2xl font-semibold text-[#0F172B] mb-6"
                style={{ letterSpacing: '-0.5px' }}
              >
                Field-tested by a real human
              </h2>
              <p className="text-base text-[#45556C] leading-relaxed mb-4">
                FriendLens is built by Erik Newton, an entrepreneur and author who has spent years
                studying why adult friendships drift, even when people care and mean well.
              </p>
              <p className="text-base text-[#45556C] leading-relaxed">
                FriendLens is a private tool, not a network, designed to help you see your social
                life more clearly and make grounded decisions about it.
              </p>
              <div className="mt-8">
                <CTAButton text="Try FriendLens" variant="primary" />
              </div>
            </div>
          </section>

        </main>
      </div>
    </>
  )
}