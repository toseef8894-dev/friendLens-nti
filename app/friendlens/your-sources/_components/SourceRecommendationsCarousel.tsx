'use client'

import { useState } from 'react'
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  getSourceRecommendations,
  inferPurpose,
  type SourceRecommendation,
  type RecommendationCategory,
} from '../lib/recommendations'
import type { SourceWithSignal } from '../types'

// ── Category label config ──────────────────────────────────────────────────

const CATEGORY_LABEL: Record<RecommendationCategory, string> = {
  primary:   'Primary',
  secondary: 'Next Step',
  rebalance: 'Rebalance',
  expand:    'Expand',
  optimize:  'Optimize',
  advanced:  'Level Up',
  map:       'Map',
}

const CATEGORY_COLOR: Record<RecommendationCategory, { bg: string; text: string }> = {
  primary:   { bg: '#F5F3FF', text: '#7C3AED' },
  secondary: { bg: '#EFF6FF', text: '#1D4ED8' },
  rebalance: { bg: '#FFF7ED', text: '#C2410C' },
  expand:    { bg: '#F0FDF4', text: '#15803D' },
  optimize:  { bg: '#FFFBEB', text: '#92400E' },
  advanced:  { bg: '#FDF4FF', text: '#9810FA' },
  map:       { bg: '#F0F9FF', text: '#0369A1' },
}

// ── Component ──────────────────────────────────────────────────────────────

interface SourceRecommendationsCarouselProps {
  source: SourceWithSignal
  totalFriendsCount: number
  /** Show a muted note when source is instrumental instead of returning null */
  showInstrumentalNote?: boolean
}

export default function SourceRecommendationsCarousel({
  source,
  totalFriendsCount,
  showInstrumentalNote = false,
}: SourceRecommendationsCarouselProps) {
  const [index, setIndex] = useState(0)

  const purpose = inferPurpose(source.source_type)
  const recommendations = getSourceRecommendations(source, totalFriendsCount)

  // Reset index when source changes (caller passes new source object)
  // Using source.id as a key on the parent is the cleanest approach, but
  // we guard here too so index never points out-of-bounds.
  const safeIndex = Math.min(index, Math.max(0, recommendations.length - 1))

  if (purpose === 'instrumental') {
    if (!showInstrumentalNote) return null
    return (
      <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4">
        <p className="text-sm text-[#90A1B9] italic" style={{ letterSpacing: '-0.15px' }}>
          This source is marked as instrumental, so friendship recommendations are not shown.
        </p>
      </div>
    )
  }

  if (!recommendations.length) return null

  const rec: SourceRecommendation = recommendations[safeIndex]
  const catColor = CATEGORY_COLOR[rec.category]
  const catLabel = CATEGORY_LABEL[rec.category]
  const total = recommendations.length

  return (
    <div className="rounded-2xl border border-purple-100 bg-white shadow-md px-5 py-4 flex flex-col gap-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        {/* Icon + content */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#9810FA] to-[#C800DE] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-white" strokeWidth={1.67} />
          </div>
          <div className="min-w-0">
            {/* Category pill + label */}
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ letterSpacing: '0.6px', color: '#9810FA' }}
              >
                FriendLens Insight
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ backgroundColor: catColor.bg, color: catColor.text }}
              >
                {catLabel}
              </span>
            </div>

            {/* Title */}
            <p
              className="text-sm font-semibold text-[#0F172B] leading-snug mb-1"
              style={{ letterSpacing: '-0.15px' }}
            >
              {rec.title}
            </p>

            {/* Body */}
            <p
              className="text-sm text-[#62748E] leading-relaxed"
              style={{ letterSpacing: '-0.15px' }}
            >
              {rec.body}
            </p>
          </div>
        </div>

        {/* Prev / next navigation — spec: no forward wrap at last card */}
        {total > 1 && (
          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              disabled={safeIndex === 0}
              className="p-1 rounded-lg text-[#62748E] hover:bg-[#F1F5F9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous recommendation"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#62748E] font-medium w-8 text-center">
              {safeIndex + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(i + 1, total - 1))}
              disabled={safeIndex === total - 1}
              className="p-1 rounded-lg text-[#62748E] hover:bg-[#F1F5F9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next recommendation"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
