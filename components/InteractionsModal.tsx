'use client'

import { ArchetypeId } from '@/lib/nti-scoring'
import { ARCHETYPES } from '@/lib/nti-config'
import { INTERACTIONS } from '@/lib/interactions'

interface InteractionsModalProps {
    primaryArchetypeId: ArchetypeId | null
    onClose: () => void
}

export function InteractionsModal({ primaryArchetypeId, onClose }: InteractionsModalProps) {
    if (!primaryArchetypeId) return null

    const interactionData = INTERACTIONS[primaryArchetypeId]
    if (!interactionData) return null

    const strongArchetypes = interactionData.strong.map(id => ARCHETYPES[id])
    const frictionArchetypes = interactionData.friction.map(id => ARCHETYPES[id])
    const primaryArchetype = ARCHETYPES[primaryArchetypeId]

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="How Types Interact"
        >
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
                aria-hidden
            />

            <div className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto nti-scroll-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-[#9810FA] to-[#C800DE] text-white">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2">
                                How Types Interact
                            </h2>
                            <p className="text-sm opacity-90">
                                Friendships are shaped by how types interact. Understand the patterns between types and improve relationships.                             </p>
                            {primaryArchetype && (
                                <div className="mt-3 text-sm font-semibold opacity-95">
                                    Based on your type: {primaryArchetype.name}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full bg-white/15 hover:bg-white/25 transition-colors px-3 py-2 text-sm flex-shrink-0"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 5L5 15" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 5L15 15" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="px-6 py-6 space-y-6">
                    <section>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Works well with
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {strongArchetypes.map((archetype) => (
                                <div
                                    key={archetype.id}
                                    className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100"
                                >
                                    <div className="font-semibold text-indigo-900 mb-1">
                                        {archetype.name}
                                    </div>
                                    <div className="text-sm text-indigo-700">
                                        {archetype.tagline}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-gray-600 text-sm mt-3">
                            These archetypes tend to complement your natural strengths and communication style.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Common friction with
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {frictionArchetypes.map((archetype) => (
                                <div
                                    key={archetype.id}
                                    className="bg-yellow-50 rounded-xl p-4 border border-yellow-200"
                                >
                                    <div className="font-semibold text-yellow-900 mb-1">
                                        {archetype.name}
                                    </div>
                                    <div className="text-sm text-yellow-700">
                                        {archetype.tagline}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-gray-600 text-sm mt-3">
                            These pairings may require more intentional communication and understanding of different needs.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            How to make it work
                        </h3>
                        <ul className="space-y-2">
                            {interactionData.tips.map((tip, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <span className="text-indigo-600 font-semibold mt-1">•</span>
                                    <span className="text-gray-700 leading-relaxed">{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    )
}
