'use client'

import { ArchetypeId } from '@/lib/nti-scoring'
import { getArchetypeDetails } from '@/data/archetypes'

interface ArchetypeModalProps {
    archetypeId: ArchetypeId | null
    onClose: () => void
}

export function ArchetypeModal({ archetypeId, onClose }: ArchetypeModalProps) {
    if (!archetypeId) return null

    const archetypeDetails = getArchetypeDetails(archetypeId)
    if (!archetypeDetails) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`${archetypeDetails.name} details`}
        >
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
                aria-hidden
            />

            <div className="relative w-full max-w-[900px] h-[600px] bg-white rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden flex flex-col">
                <div className="p-10 bg-gradient-to-r from-[#9810FA] to-[#C800DE] text-white flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className='flex flex-row gap-2 items-center'>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_42_1061)">
                                        <path d="M6.62455 10.3332C6.56503 10.1025 6.44477 9.89191 6.27629 9.72343C6.10781 9.55495 5.89726 9.43469 5.66655 9.37517L1.57655 8.32051C1.50677 8.3007 1.44535 8.25867 1.40162 8.2008C1.35789 8.14293 1.33423 8.07238 1.33423 7.99984C1.33423 7.9273 1.35789 7.85675 1.40162 7.79888C1.44535 7.74101 1.50677 7.69898 1.57655 7.67917L5.66655 6.62384C5.89718 6.56438 6.10767 6.44422 6.27615 6.27587C6.44462 6.10751 6.56492 5.8971 6.62455 5.66651L7.67921 1.57651C7.69882 1.50645 7.7408 1.44474 7.79876 1.40077C7.85672 1.35681 7.92747 1.33301 8.00021 1.33301C8.07296 1.33301 8.14371 1.35681 8.20166 1.40077C8.25962 1.44474 8.30161 1.50645 8.32121 1.57651L9.37521 5.66651C9.43473 5.89722 9.55499 6.10777 9.72347 6.27625C9.89195 6.44473 10.1025 6.56499 10.3332 6.62451L14.4232 7.67851C14.4935 7.69791 14.5556 7.73985 14.5998 7.79789C14.644 7.85594 14.6679 7.92688 14.6679 7.99984C14.6679 8.0728 14.644 8.14374 14.5998 8.20179C14.5556 8.25983 14.4935 8.30177 14.4232 8.32117L10.3332 9.37517C10.1025 9.43469 9.89195 9.55495 9.72347 9.72343C9.55499 9.89191 9.43473 10.1025 9.37521 10.3332L8.32055 14.4232C8.30094 14.4932 8.25896 14.5549 8.201 14.5989C8.14304 14.6429 8.07229 14.6667 7.99955 14.6667C7.9268 14.6667 7.85605 14.6429 7.79809 14.5989C7.74013 14.5549 7.69815 14.4932 7.67855 14.4232L6.62455 10.3332Z" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M13.3333 2V4.66667" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M14.6667 3.33301H12" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M2.66675 11.333V12.6663" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M3.33333 12H2" stroke="white" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_42_1061">
                                            <rect width="16" height="16" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <span className="font-['Inter'] text-xs font-extrabold opacity-90 text-white tracking-normal">
                                    Full Profile
                                </span>
                            </div>

                            <div className="text-5xl font-['Inter'] font-semibold leading-tight mb-2">
                                {archetypeDetails.name}
                            </div>
                            <div className="font-['Inter'] text-lg font- leading-snug opacity-95">
                                {archetypeDetails.crown}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full bg-white/25 p-2 flex-shrink-0 flex items-center justify-center"
                            aria-label="Close modal"
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 5L5 15" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5 5L15 15" stroke="white" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-10 overflow-y-auto flex-1 nti-scroll-hidden">
                    <div className="text-[16px] font-semibold text-zinc-900">
                        What this archetype contributes to the friendship field?
                    </div>

                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                        <div>
                            <div className=" flex flex-row gap-2 text-[11px] font-semibold tracking-[0.12em] text-zinc-400">
                                <svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 3C0 1.34315 1.34315 0 3 0C4.65685 0 6 1.34315 6 3C6 4.65685 4.65685 6 3 6C1.34315 6 0 4.65685 0 3Z" fill="#CAD5E2" />
                                </svg>

                                WHAT THEY BRING
                            </div>

                            <div className=" font-normal text-xl font-['Inter'] leading-[1.35] text-zinc-900">
                                {archetypeDetails.details.whatTheyBring}
                            </div>

                            <div className="mt-8 h-px w-full bg-zinc-200/80" />

                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-10">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.91658 0.583008L3.49992 6.99967L0.583252 4.08301" stroke="#009689" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>

                                        <div className="text-[12px] font-semibold tracking-[0.12em] text-[#009689]">
                                            THRIVES WHEN
                                        </div>
                                    </div>
                                    <p className="mt-3 text-[14px] leading-[1.6] text-zinc-700">
                                        {archetypeDetails.details.thrivesWhen}
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10.5 3.5L3.5 10.5" stroke="#90A1B9" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M3.5 3.5L10.5 10.5" stroke="#90A1B9" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>

                                        <div className="text-[11px] font-semibold tracking-[0.12em] text-[#90A1B9]">
                                            STALL PATTERN
                                        </div>
                                    </div>
                                    <p className="mt-3 text-[14px] leading-[1.6] text-zinc-700">
                                        {archetypeDetails.details.stallPattern}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-[#F8FAFC] border border-[#F1F5F9] p-6">
                            <div className="flex items-center justify-between">
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z" fill="#F3E8FF" />
                                    <path d="M14.1667 20H25.8334" stroke="#9810FA" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M20 14.167L25.8333 20.0003L20 25.8337" stroke="#9810FA" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>

                            </div>

                            <div className="mt-4 text-[11px] font-semibold tracking-[0.12em] text-[#9810FA]">
                                ONE PRACTICAL MOVE
                            </div>

                            <div className="mt-2 text-[22px] leading-[1.35] font-semibold text-[#0F172B]">
                                “{archetypeDetails.details.onePracticalMove}”
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
