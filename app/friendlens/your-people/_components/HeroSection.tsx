'use client'

import { useSearchParams } from 'next/navigation'

export default function HeroSection() {
  const searchParams = useSearchParams()
  const step = searchParams.get('step') ?? 'add'

  const subheading =
    step === 'table'
      ? 'A living picture of the people in your life right now'
      : 'Identify and enter your friends'

  return (
    <div className="flex flex-col items-center mb-12 max-w-3xl">
      <h1
        className="text-4xl sm:text-5xl md:text-[64px] font-semibold leading-tight md:leading-[88px] text-center"
        style={{ letterSpacing: '-2px' }}
      >
        <span className="text-[#0F172B]">Your </span>
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          friendships
        </span>
      </h1>

      <p
        className="text-lg sm:text-2xl font-medium leading-6 sm:leading-7 text-center text-[#45556C] max-w-[640px] px-2"
        style={{ letterSpacing: '1.3px' }}
      >
        {subheading}
      </p>
    </div>
  )
}
