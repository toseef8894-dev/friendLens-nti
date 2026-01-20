'use client'

import Link from "next/link"
import dynamic from 'next/dynamic'
import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                Understand your{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  friendship patterns
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Discover your friendship type and learn how you connect and grow relationships.
                Takes less than 5 minutes
              </p>
              <div className="mt-10">
                <CTAButton
                  text="Add better people to your life with FriendLens.ai"
                  variant="primary"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              How FriendLens works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Take the Assessment</h3>
                <p className="text-gray-600">
                  Answer quick questions about how you socialize
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Discover Your Archetype</h3>
                <p className="text-gray-600">
                  We will map to one of 8 primary friendship types
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-pink-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Grow Better Friendships</h3>
                <p className="text-gray-600">
                  Use your insights to understand how you find and maintain better connections
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Archetypes Preview */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
              8 Friend Types
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Discover which type matches your social style and how you connect with others.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: "Anchor", tagline: "Stability and presence", color: "bg-indigo-100 text-indigo-700" },
                { name: "Connector", tagline: "Bringing people together", color: "bg-purple-100 text-purple-700" },
                { name: "Hunter", tagline: "Momentum and pursuit", color: "bg-orange-100 text-orange-700" },
                { name: "Bonder", tagline: "Depth and intimacy", color: "bg-pink-100 text-pink-700" },
                { name: "Sage", tagline: "Perspective and meaning", color: "bg-blue-100 text-blue-700" },
                { name: "FlowMaker", tagline: "Ease and enjoyment", color: "bg-green-100 text-green-700" },
                { name: "Builder", tagline: "Structure and hosting", color: "bg-teal-100 text-teal-700" },
                { name: "Explorer", tagline: "Novelty and expansion", color: "bg-yellow-100 text-yellow-700" },
              ].map((archetype) => (
                <div
                  key={archetype.name}
                  className={`${archetype.color} rounded-xl p-4 text-center transition-transform hover:scale-105`}
                >
                  <p className="font-semibold text-sm">{archetype.name}</p>
                  <p className="text-xs opacity-75 mt-1">{archetype.tagline}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Understand your friendship patterns?
            </h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
              Take the free 5-minute assessment and discover insights that will transform how you build and maintain friendships.
            </p>
            <CTAButton
              text="Get Started Free"
              variant="secondary"
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2026 FriendLens. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
