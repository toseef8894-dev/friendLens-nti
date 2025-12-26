import Link from "next/link"
import CTAButton from "@/components/CTAButton"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
              Understand your{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                friendship wiring
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover your unique Friendship Archetype and learn how you connect, bond, and grow relationships.
              Get novel clarity of self in just 5 minutes.
            </p>
            <div className="mt-10">
              <CTAButton 
                text="Add more better humans to your life with FriendLens.ai"
                variant="primary"
              />
            </div>
            {/* <p className="mt-4 text-sm text-gray-500">
              Free assessment • No credit card required
            </p> */}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How FriendLens Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Take the Assessment</h3>
              <p className="text-gray-600">
                Answer quick questions using our unique ranked-choice format to reveal your social patterns.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Discover Your Archetype</h3>
              <p className="text-gray-600">
                Our algorithm maps you to one of 16 Friendship Archetypes based on 18 social dimensions.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-pink-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Grow Better Friendships</h3>
              <p className="text-gray-600">
                Use your insights to understand how you bond, handle conflict, and find your ideal connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Archetypes Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            16 Friendship Archetypes
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            From The Organizer to The Nurturer, discover which archetype matches your social style.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "The Organizer", group: "Energetic Connectors", color: "bg-orange-100 text-orange-700" },
              { name: "The Welcomer", group: "Energetic Connectors", color: "bg-yellow-100 text-yellow-700" },
              { name: "The Adventurer", group: "Energetic Connectors", color: "bg-red-100 text-red-700" },
              { name: "The Listener", group: "Steady Supporters", color: "bg-green-100 text-green-700" },
              { name: "The Rock", group: "Steady Supporters", color: "bg-teal-100 text-teal-700" },
              { name: "The Nurturer", group: "Warm Supporters", color: "bg-pink-100 text-pink-700" },
              { name: "The Team Player", group: "Everyday Connectors", color: "bg-blue-100 text-blue-700" },
              { name: "The Explorer", group: "Steady Supporters", color: "bg-indigo-100 text-indigo-700" },
            ].map((archetype) => (
              <div
                key={archetype.name}
                className={`${archetype.color} rounded-xl p-4 text-center transition-transform hover:scale-105`}
              >
                <p className="font-semibold text-sm">{archetype.name}</p>
                <p className="text-xs opacity-75 mt-1">{archetype.group}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 mt-6 text-sm">
            + 8 more archetypes to discover
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to understand your friendship wiring?
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
            © 2025 FriendLens. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
