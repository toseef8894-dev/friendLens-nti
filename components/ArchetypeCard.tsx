'use client'

import { ArchetypeId } from '@/lib/nti-scoring'
import { ARCHETYPES } from '@/lib/nti-config'
import { useRef, useEffect, useState } from 'react'

interface ArchetypeCardProps {
    archetypeId: ArchetypeId
    onOpen: () => void
}

function fallbackSentence(text: string, index: number) {
    const parts = (text || '')
        .split(/[.!?]\s+/)
        .map(s => s.trim())
        .filter(Boolean)
    return parts[index] || parts[0] || ''
}

export function ArchetypeCard({ archetypeId, onOpen }: ArchetypeCardProps) {
    const archetype: any = ARCHETYPES[archetypeId]
    if (!archetype) return null

    const thrivesWhen =
        archetype?.details?.thrivesWhen || fallbackSentence(archetype.description, 0)

    const stallPattern =
        archetype?.details?.stallPattern || fallbackSentence(archetype.description, 1)

    const onePracticalMove =
        archetype?.details?.onePracticalMove || fallbackSentence(archetype.description, 2)

    const contentRef = useRef<HTMLDivElement>(null)
    const [lineHeight, setLineHeight] = useState(200)

    useEffect(() => {
        if (contentRef.current) {
            const height = contentRef.current.offsetHeight
            setLineHeight(Math.max(height - 15, 100))
        }
    }, [thrivesWhen, stallPattern, onePracticalMove])

    return (
        <div className="w-full">
            <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                <div className="flex flex-row justify-between items-center relative p-5 text-white bg-gradient-to-r from-[#9810FA] to-[#C800DE]">
                    <div>
                        <div className="text-[20px] font-bold leading-none">
                            {archetype.name}
                        </div>
                        <div className="mt-2 text-[10px] opacity-90">
                            {archetype.tagline}
                        </div>

                    </div>

                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16Z" fill="white" fill-opacity="0.2" />
                        <g opacity="0.9" clip-path="url(#clip0_49_120)">
                            <path d="M14.7965 18.0421C14.7444 17.8403 14.6392 17.656 14.4918 17.5086C14.3444 17.3612 14.1601 17.256 13.9583 17.2039L10.3795 16.2811C10.3185 16.2637 10.2647 16.227 10.2264 16.1763C10.1882 16.1257 10.1675 16.0639 10.1675 16.0005C10.1675 15.937 10.1882 15.8753 10.2264 15.8246C10.2647 15.774 10.3185 15.7372 10.3795 15.7199L13.9583 14.7965C14.1601 14.7444 14.3442 14.6393 14.4917 14.492C14.6391 14.3447 14.7443 14.1606 14.7965 13.9588L15.7193 10.3801C15.7365 10.3188 15.7732 10.2648 15.8239 10.2263C15.8747 10.1878 15.9366 10.167 16.0002 10.167C16.0639 10.167 16.1258 10.1878 16.1765 10.2263C16.2272 10.2648 16.2639 10.3188 16.2811 10.3801L17.2033 13.9588C17.2554 14.1607 17.3606 14.3449 17.5081 14.4923C17.6555 14.6398 17.8397 14.745 18.0416 14.7971L21.6203 15.7193C21.6819 15.7363 21.7362 15.773 21.7748 15.8238C21.8135 15.8746 21.8345 15.9366 21.8345 16.0005C21.8345 16.0643 21.8135 16.1264 21.7748 16.1772C21.7362 16.228 21.6819 16.2647 21.6203 16.2816L18.0416 17.2039C17.8397 17.256 17.6555 17.3612 17.5081 17.5086C17.3606 17.656 17.2554 17.8403 17.2033 18.0421L16.2805 21.6209C16.2634 21.6822 16.2266 21.7362 16.1759 21.7747C16.1252 21.8131 16.0633 21.834 15.9996 21.834C15.936 21.834 15.8741 21.8131 15.8234 21.7747C15.7726 21.7362 15.7359 21.6822 15.7188 21.6209L14.7965 18.0421Z" fill="white" stroke="white" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M20.6667 10.75V13.0833V10.75Z" fill="white" />
                            <path d="M20.6667 10.75V13.0833" stroke="white" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M21.8333 11.917H19.5H21.8333Z" fill="white" />
                            <path d="M21.8333 11.917H19.5" stroke="white" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M11.3333 18.917V20.0837V18.917Z" fill="white" />
                            <path d="M11.3333 18.917V20.0837" stroke="white" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M11.9167 19.5H10.75H11.9167Z" fill="white" />
                            <path d="M11.9167 19.5H10.75" stroke="white" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round" />
                        </g>
                        <defs>
                            <clipPath id="clip0_49_120">
                                <rect width="14" height="14" fill="white" transform="translate(9 9)" />
                            </clipPath>
                        </defs>
                    </svg>

                </div>

                <div className='w-full text-left p-6'>
                    <div className="relative">
                        <div
                            className="absolute left-[24px] -translate-x-1/2 w-[2px] rounded-full"
                            style={{
                                top: 15,
                                height: `${lineHeight}px`,
                                background: 'linear-gradient(to bottom, #00D5BE 0%, #CAD5E2 50%, #8E51FF 100%)',
                            }}
                        />

                        <div ref={contentRef} className="space-y-0">
                            {/* Thrives when */}
                            <div className="flex items-start pb-6">
                                <div className="relative z-10 flex-shrink-0 w-[48px] flex justify-center mt-0.5">
                                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g filter="url(#filter0_dd_81_43)">
                                            <mask id="path-1-inside-1_81_43" fill="white">
                                                <path d="M3 14C3 7.37258 8.37258 2 15 2C21.6274 2 27 7.37258 27 14C27 20.6274 21.6274 26 15 26C8.37258 26 3 20.6274 3 14Z" />
                                            </mask>
                                            <path d="M3 14C3 7.37258 8.37258 2 15 2C21.6274 2 27 7.37258 27 14C27 20.6274 21.6274 26 15 26C8.37258 26 3 20.6274 3 14Z" fill="white" shapeRendering="crispEdges" />
                                            <path d="M15 26V24C9.47715 24 5 19.5228 5 14H3H1C1 21.732 7.26801 28 15 28V26ZM27 14H25C25 19.5228 20.5228 24 15 24V26V28C22.732 28 29 21.732 29 14H27ZM15 2V4C20.5228 4 25 8.47715 25 14H27H29C29 6.26801 22.732 0 15 0V2ZM15 2V0C7.26801 0 1 6.26801 1 14H3H5C5 8.47715 9.47715 4 15 4V2Z" fill="#CBFBF1" mask="url(#path-1-inside-1_81_43)" />
                                            <path d="M19.6666 10.5L13.25 16.9167L10.3333 14" stroke="#009689" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                        <defs>
                                            <filter id="filter0_dd_81_43" x="0" y="0" width="30" height="30" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                                <feMorphology radius="1" operator="erode" in="SourceAlpha" result="effect1_dropShadow_81_43" />
                                                <feOffset dy="1" />
                                                <feGaussianBlur stdDeviation="1" />
                                                <feComposite in2="hardAlpha" operator="out" />
                                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_81_43" />
                                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                                <feOffset dy="1" />
                                                <feGaussianBlur stdDeviation="1.5" />
                                                <feComposite in2="hardAlpha" operator="out" />
                                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                                                <feBlend mode="normal" in2="effect1_dropShadow_81_43" result="effect2_dropShadow_81_43" />
                                                <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_81_43" result="shape" />
                                            </filter>
                                        </defs>
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="mt-2 text-[11px] font-semibold tracking-[0.12em] text-[#009689]">
                                        THRIVES WHEN
                                    </div>
                                    <div className="mt-1.5 text-[14px] font-semibold leading-snug text-zinc-900">
                                        {thrivesWhen}
                                    </div>
                                </div>
                            </div>

                            {/* Stall pattern */}
                            <div className="flex items-start pb-6">
                                <div className="relative z-10 flex-shrink-0 w-[48px] flex justify-center mt-0.5">
                                    <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g filter="url(#filter0_dd_81_46)">
                                            <mask id="path-1-inside-1_81_46" fill="white">
                                                <path d="M3 14C3 7.37258 8.37258 2 15 2C21.6274 2 27 7.37258 27 14C27 20.6274 21.6274 26 15 26C8.37258 26 3 20.6274 3 14Z" />
                                            </mask>
                                            <path d="M3 14C3 7.37258 8.37258 2 15 2C21.6274 2 27 7.37258 27 14C27 20.6274 21.6274 26 15 26C8.37258 26 3 20.6274 3 14Z" fill="white" shapeRendering="crispEdges" />
                                            <path d="M15 26V24C9.47715 24 5 19.5228 5 14H3H1C1 21.732 7.26801 28 15 28V26ZM27 14H25C25 19.5228 20.5228 24 15 24V26V28C22.732 28 29 21.732 29 14H27ZM15 2V4C20.5228 4 25 8.47715 25 14H27H29C29 6.26801 22.732 0 15 0V2ZM15 2V0C7.26801 0 1 6.26801 1 14H3H5C5 8.47715 9.47715 4 15 4V2Z" fill="#E2E8F0" mask="url(#path-1-inside-1_81_46)" />
                                            <path d="M18.5 10.5L11.5 17.5" stroke="#90A1B9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M11.5 10.5L18.5 17.5" stroke="#90A1B9" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                        <defs>
                                            <filter id="filter0_dd_81_46" x="0" y="0" width="30" height="30" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                                <feMorphology radius="1" operator="erode" in="SourceAlpha" result="effect1_dropShadow_81_46" />
                                                <feOffset dy="1" />
                                                <feGaussianBlur stdDeviation="1" />
                                                <feComposite in2="hardAlpha" operator="out" />
                                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_81_46" />
                                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                                <feOffset dy="1" />
                                                <feGaussianBlur stdDeviation="1.5" />
                                                <feComposite in2="hardAlpha" operator="out" />
                                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                                                <feBlend mode="normal" in2="effect1_dropShadow_81_46" result="effect2_dropShadow_81_46" />
                                                <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_81_46" result="shape" />
                                            </filter>
                                        </defs>
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="mt-2 text-[11px] font-semibold tracking-[0.12em] text-[#90A1B9]">
                                        STALL PATTERN
                                    </div>
                                    <div className="mt-1.5 text-[14px] font-semibold leading-snug text-zinc-900">
                                        {stallPattern}
                                    </div>
                                </div>
                            </div>

                            {/* One practical move */}
                            <div className="flex items-start">
                                <div className="relative z-10 flex-shrink-0 w-[48px] flex justify-center -mt-[2px]">
                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g filter="url(#filter0_ddd_81_50)">
                                            <path d="M12 14C12 7.37258 17.3726 2 24 2C30.6274 2 36 7.37258 36 14C36 20.6274 30.6274 26 24 26C17.3726 26 12 20.6274 12 14Z" fill="#7F22FE" shapeRendering="crispEdges" />
                                            <path d="M19.9167 14H28.0834" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M24 9.91699L28.0833 14.0003L24 18.0837" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                                        </g>
                                        <defs>
                                            <filter id="filter0_ddd_81_50" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                                <feMorphology radius="4" operator="erode" in="SourceAlpha" result="effect1_dropShadow_81_50" />
                                                <feOffset dy="4" />
                                                <feGaussianBlur stdDeviation="3" />
                                                <feComposite in2="hardAlpha" operator="out" />
                                                <feColorMatrix type="matrix" values="0 0 0 0 0.866542 0 0 0 0 0.837873 0 0 0 0 1 0 0 0 1 0" />
                                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_81_50" />
                                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                                <feMorphology radius="3" operator="erode" in="SourceAlpha" result="effect2_dropShadow_81_50" />
                                                <feOffset dy="10" />
                                                <feGaussianBlur stdDeviation="7.5" />
                                                <feComposite in2="hardAlpha" operator="out" />
                                                <feColorMatrix type="matrix" values="0 0 0 0 0.866542 0 0 0 0 0.837873 0 0 0 0 1 0 0 0 1 0" />
                                                <feBlend mode="normal" in2="effect1_dropShadow_81_50" result="effect2_dropShadow_81_50" />
                                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                                                <feMorphology radius="2" operator="dilate" in="SourceAlpha" result="effect3_dropShadow_81_50" />
                                                <feOffset />
                                                <feComposite in2="hardAlpha" operator="out" />
                                                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" />
                                                <feBlend mode="normal" in2="effect2_dropShadow_81_50" result="effect3_dropShadow_81_50" />
                                                <feBlend mode="normal" in="SourceGraphic" in2="effect3_dropShadow_81_50" result="shape" />
                                            </filter>
                                        </defs>
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className=" mt-1 text-[11px] font-semibold tracking-[0.12em] text-[#9810FA]">
                                        ONE PRACTICAL MOVE
                                    </div>
                                    <div className="mt-2 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9] px-4 py-3">
                                        <div className="text-[14px] font-semibold leading-snug text-zinc-800">
                                            {onePracticalMove}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="px-5 pb-4 pt-2">
                    <button
                        type="button"
                        onClick={onOpen}
                        className="w-full flex items-center justify-end gap-2 text-[12px] font-semibold tracking-[0.18em] text-[#9810FA] hover:text-violet-600"
                    >
                        VIEW DETAILS <span aria-hidden>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.25 10.5L8.75 7L5.25 3.5" stroke="#9810FA" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}
