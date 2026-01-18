'use client'

import { Lightbulb, Users, ArrowRightLeft } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { ArchetypeModal } from './ArchetypeModal'
import { InteractionsModal } from './InteractionsModal'
import { ArchetypeId } from '@/lib/nti-scoring'

interface InsightsProps {
    primaryArchetypeId?: ArchetypeId | null
}

interface InsightCard {
    icon: React.ReactNode
    title: string
    description: string
    href?: string
    onClick?: () => void
}

function InsightsContent({ primaryArchetypeId }: InsightsProps) {
    const searchParams = useSearchParams()
    const anonymousParam = searchParams.get('anonymous')
    const queryString = anonymousParam === 'true' ? '?anonymous=true' : ''
    const [isArchetypeModalOpen, setIsArchetypeModalOpen] = useState(false)
    const [isInteractionsModalOpen, setIsInteractionsModalOpen] = useState(false)

    const insights: InsightCard[] = [
        {
            icon: <Lightbulb className="w-5 h-5" />,
            title: 'Understanding Your Type',
            description: 'Your type shows how you tend to connect, what energizes you, and where you naturally invest in friendships. It\'s an orientation, not a label—a starting point for making small, intentional choices.',
            onClick: () => setIsArchetypeModalOpen(true)
        },
        {
            icon: <Users className="w-5 h-5" />,
            title: 'The Other Seven Types',
            description: 'Each type represents a different way people contribute to friendships. Understanding them helps explain why some connections feel easy, while others need more translation.',
            href: `/results/other-types${queryString}`
        },
        {
            icon: <ArrowRightLeft className="w-5 h-5" />,
            title: 'How Types Interact',
            description: 'Friendships are shaped by how orientations interact over time; Some pairings flow naturally; others need adjustment. Seeing the pattern helps connections deepen instead of stall.',
            onClick: () => setIsInteractionsModalOpen(true)
        }
    ]

    return (
        <>
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Insights</h2>
                {insights.map((insight, index) => {
                    if (insight.onClick) {
                        const isDisabled = !primaryArchetypeId
                        return (
                            <button
                                key={index}
                                onClick={insight.onClick}
                                disabled={isDisabled}
                                className={`w-full text-left bg-white rounded-xl p-5 shadow-sm border border-gray-100 transition-shadow group ${
                                    isDisabled
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:shadow-md cursor-pointer'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center transition-colors ${
                                            !isDisabled && 'group-hover:bg-indigo-200'
                                        }`}
                                    >
                                        {insight.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-semibold text-gray-900 mb-2">
                                            {insight.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {insight.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        )
                    }
                    return (
                        <Link
                            key={index}
                            href={insight.href!}
                            className="block bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                                    {insight.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                                        {insight.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {insight.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
            {primaryArchetypeId && (
                <>
                    <ArchetypeModal
                        archetypeId={isArchetypeModalOpen ? primaryArchetypeId : null}
                        onClose={() => setIsArchetypeModalOpen(false)}
                    />
                    <InteractionsModal
                        primaryArchetypeId={isInteractionsModalOpen ? primaryArchetypeId : null}
                        onClose={() => setIsInteractionsModalOpen(false)}
                    />
                </>
            )}
        </>
    )
}

export default function Insights({ primaryArchetypeId }: InsightsProps) {
    return (
        <Suspense fallback={
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Insights</h2>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse">
                    <div className="h-20 bg-gray-200 rounded"></div>
                </div>
            </div>
        }>
            <InsightsContent primaryArchetypeId={primaryArchetypeId} />
        </Suspense>
    )
}
