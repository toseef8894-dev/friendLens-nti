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
              className="text-4xl sm:text-5xl md:text-[64px] font-semibold leading-tight md:leading-[78px] text-center text-[#0F172B]"
              style={{ letterSpacing: '-2px' }}
            >
              One more good friend
            </h1>
            <p
              className="mt-6 text-lg sm:text-xl font-medium text-center text-[#45556C] max-w-xl mx-auto"
              style={{ letterSpacing: '-0.2px' }}
            >
              Whether you have a few friends or many, one more good friend is always possible
            </p>
            <div className="mt-10">
              <CTAButton text="Get your friendship snapshot" variant="primary" />
            </div>
            <p className="mt-4 text-sm text-[#62748E]">
              Takes 2–3 minutes. Private and secure.
            </p>
            {/* <p
              className="mt-2 text-sm font-normal text-center text-[#62748E] max-w-[380px] mx-auto"
              style={{ letterSpacing: '-0.312px' }}
            >
              Private and secure — a place to reflect on where to invest your energy.
            </p> */}
          </section>

          {/* What You'll See */}
          <section className="w-full max-w-3xl mb-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 sm:p-10">
              <h2
                className="text-xl sm:text-2xl font-semibold text-center text-[#0F172B] mb-8"
                style={{ letterSpacing: '-0.5px' }}
              >
                What you&apos;ll see with FriendLens
              </h2>
              <ul className="space-y-4 max-w-md mx-auto">
                {[
                  'Where to meet one more good friend',
                  'How much time you actually have',
                  'How to develop one more good friend',
                  'Which relationships aren’t working',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 w-5 h-5 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    </span>
                    <span className="text-base text-[#45556C] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* How It Works */}
          <section className="w-full max-w-3xl mb-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 sm:p-10">
              <h2
                className="text-xl sm:text-2xl font-semibold text-center text-[#0F172B] mb-8"
                style={{ letterSpacing: '-0.5px' }}
              >
                How it works
              </h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  {
                    num: '1',
                    title: 'Add a few people',
                    desc: 'Takes a minute. No need to be complete.',
                    color: 'text-indigo-600',
                    bg: 'bg-indigo-50',
                  },
                  {
                    num: '2',
                    title: 'Add some groups and sources',
                    desc: 'Who initiates. What\'s reciprocal. Where things stall.',
                    color: 'text-purple-600',
                    bg: 'bg-purple-50',
                  },
                  {
                    num: '3',
                    title: 'See patterns and opportunities',
                    desc: 'So you can decide what to invest in—and what to let go.',
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
                Why it matters
              </h2>
              <p className="text-base sm:text-lg text-[#45556C] leading-relaxed">
                People move. Friends drift. Life gets busy.
                <br />
                If you don’t actively shape your social life, it slowly degrades.
              </p>
              <p className="mt-4 text-base sm:text-lg text-[#45556C] leading-relaxed">
                FriendLens helps you see what’s working, so you can make one more good friend.
                <br />
              </p>
            </div>
          </section>

          {/* Founder / Credibility */}
          <section className="w-full max-w-3xl">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 sm:p-10 text-center">
              <h2
                className="text-xl sm:text-2xl font-semibold text-[#0F172B] mb-6"
                style={{ letterSpacing: '-0.5px' }}
              >
                Built from real-world experience
              </h2>
              <p className="text-base text-[#45556C] leading-relaxed mb-4">
                FriendLens was created by Erik Newton, an entrepreneur and author who has spent years studying how friendships actually work.
              </p>
              <p className="text-base text-[#45556C] leading-relaxed">
                It&apos;s a private tool to help you see your social world clearly and invest your time where it works.
              </p>
              <div className="mt-8">
                <CTAButton text="Get your friendship snapshot" variant="primary" />
              </div>
            </div>
          </section>

        </main>
      </div>
    </>
  )
}