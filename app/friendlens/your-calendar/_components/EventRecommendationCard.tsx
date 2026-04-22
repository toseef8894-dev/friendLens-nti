'use client'

import { Lightbulb } from 'lucide-react'
import type { EventRecommendation } from '../recommendationEngine'

interface Props {
  recommendation: EventRecommendation
  /** Called when the user taps the CTA — should open the add-event form */
  onCTAClick: () => void
}

export default function EventRecommendationCard({ recommendation, onCTAClick }: Props) {
  return (
    <div className="rounded-2xl border border-purple-100 bg-white shadow-md px-5 py-4 flex flex-col gap-3">
      {/* Header row: icon + label */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#9810FA] to-[#C800DE] flex items-center justify-center flex-shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4 text-white" strokeWidth={1.67} />
        </div>

        <div className="min-w-0 flex-1">
          {/* Label */}
          <span
            className="text-[10px] font-bold uppercase"
            style={{ letterSpacing: '0.6px', color: '#9810FA' }}
          >
            FriendLens Insight
          </span>

          {/* Message */}
          <p
            className="text-sm font-semibold text-[#0F172B] leading-snug mt-1 mb-1"
            style={{ letterSpacing: '-0.15px' }}
          >
            {recommendation.message}
          </p>
        </div>
      </div>

      {/* CTA button */}
      <button
        type="button"
        onClick={onCTAClick}
        className="self-start px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
        style={{ background: 'linear-gradient(90deg, #9810FA 0%, #C800DE 100%)' }}
      >
        {recommendation.cta}
      </button>
    </div>
  )
}
