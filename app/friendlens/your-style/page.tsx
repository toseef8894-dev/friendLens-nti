'use client'

import dynamic from 'next/dynamic'
import HeroSection from './_components/HeroSection'

const AssessmentFlow = dynamic(() => import('@/components/AssessmentFlow'), {
    ssr: false,
})

const ARCHETYPES = [
    { name: 'Anchor', tagline: 'Stability and presence', color: 'bg-indigo-100 text-indigo-700' },
    { name: 'Connector', tagline: 'Bringing people together', color: 'bg-purple-100 text-purple-700' },
    { name: 'Hunter', tagline: 'Momentum and pursuit', color: 'bg-orange-100 text-orange-700' },
    { name: 'Bonder', tagline: 'Depth and intimacy', color: 'bg-pink-100 text-pink-700' },
    { name: 'Sage', tagline: 'Perspective and meaning', color: 'bg-blue-100 text-blue-700' },
    { name: 'FlowMaker', tagline: 'Ease and enjoyment', color: 'bg-green-100 text-green-700' },
    { name: 'Builder', tagline: 'Structure and hosting', color: 'bg-teal-100 text-teal-700' },
    { name: 'Explorer', tagline: 'Novelty and expansion', color: 'bg-yellow-100 text-yellow-700' },
]

export default function YourStylePage() {
    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/bgImage.png')" }}
        >
            <main className="flex flex-col items-center pt-6 sm:pt-[40px] px-4 pb-12 sm:pb-20">
                <HeroSection />

                {/* How FriendLens Works */}
                <section className="w-full max-w-3xl mb-12">
                    <h2
                        className="text-xl sm:text-2xl font-semibold text-center text-[#0F172B] mb-8"
                        style={{ letterSpacing: '-0.5px' }}
                    >
                        How FriendLens works
                    </h2>
                    <div className="grid sm:grid-cols-3 gap-6">
                        {[
                            {
                                num: '1',
                                title: 'Take the Assessment',
                                desc: 'Answer quick questions about how you socialize',
                                color: 'text-indigo-600',
                                bg: 'bg-indigo-50',
                            },
                            {
                                num: '2',
                                title: 'Discover Your Archetype',
                                desc: 'We will map you to one of 8 primary friendship types',
                                color: 'text-purple-600',
                                bg: 'bg-purple-50',
                            },
                            {
                                num: '3',
                                title: 'Grow Better Friendships',
                                desc: 'Use your insights to understand how you find and maintain better connections',
                                color: 'text-pink-600',
                                bg: 'bg-pink-50',
                            },
                        ].map((step) => (
                            <div
                                key={step.num}
                                className="flex flex-col items-center text-center p-5 rounded-2xl bg-white/60 backdrop-blur-sm"
                            >
                                <div
                                    className={`w-12 h-12 ${step.bg} rounded-xl flex items-center justify-center mb-3`}
                                >
                                    <span className={`text-lg font-bold ${step.color}`}>{step.num}</span>
                                </div>
                                <h3 className="text-base font-semibold text-[#0F172B] mb-1">{step.title}</h3>
                                <p className="text-sm text-[#62748E] leading-5">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 8 Friend Types */}
                <section className="w-full max-w-3xl mb-12">
                    <h2
                        className="text-xl sm:text-2xl font-semibold text-center text-[#0F172B] mb-2"
                        style={{ letterSpacing: '-0.5px' }}
                    >
                        8 Friend Types
                    </h2>
                    <p className="text-sm text-center text-[#62748E] mb-6">
                        Discover which type matches your social style and how you connect with others.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {ARCHETYPES.map((archetype) => (
                            <div
                                key={archetype.name}
                                className={`${archetype.color} rounded-xl p-4 text-center`}
                            >
                                <p className="font-semibold text-sm">{archetype.name}</p>
                                <p className="text-xs opacity-75 mt-1">{archetype.tagline}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Assessment */}
                <section className="w-full max-w-3xl">
                    <AssessmentFlow />
                </section>
            </main>
        </div>
    )
}