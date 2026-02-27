import Link from "next/link"
import ContactWidget from "@/components/ContactWidget"

export const metadata = {
  title: "About | FriendLens",
  description: "Learn about FriendLens.ai and the Friendology framework created by Erik Newton.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10">About FriendLens</h1>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          {/* About FriendLens */}
          <div className="bg-indigo-50 rounded-2xl p-8">
            <p className="text-lg text-gray-800 mb-4">
              FriendLens.ai is a private tool for understanding and improving adult friendships.
              It helps you see patterns in your social life so you can make better decisions about
              where to invest your time and energy.
            </p>
            <p className="text-gray-700">
              FriendLens is not a social network, and nothing you enter is public.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What FriendLens Is</h2>
            <p>
              FriendLens focuses on reflection and engagement. There are no feeds, no public profiles,
              and no contact scraping. Your data stays private, and the product is designed to help you
              notice reciprocity, drift, and momentum without judgment or pressure.
            </p>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* About the Founder */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">About the Founder</h2>
            <p className="mb-4">
              FriendLens was created by <strong>Erik Newton</strong>, an entrepreneur and author with a
              background in technology, consulting, and independent business. Across teams, communities,
              and social groups, Erik saw the same pattern repeat: relationships failing not from bad
              intent, but from lack of visibility and structure.
            </p>
            <p>
              He developed the underlying framework, <strong>Friendology</strong>, to make friendship
              more legible and navigable in adulthood. FriendLens is where that framework becomes
              practical, usable, and impactful.
            </p>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}