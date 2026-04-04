'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown, Plus, ArrowUpDown, ArrowLeft, Lightbulb } from 'lucide-react'
import type { Friend } from '../types'
import { computeRecommendations, type Recommendation } from './recommendationEngine'

interface Column {
  key: string
  label: string
  render: (f: Friend) => React.ReactNode
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  getValue?: (f: Friend) => string | number | boolean | null
  width?: string
}

const COLUMNS: Column[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    getValue: (f) => f.name,
    render: (f) => (
      <span
        className="font-medium text-text-primary block truncate max-w-[100px] sm:max-w-[180px]"
        style={{ letterSpacing: '-0.15px', textTransform: 'capitalize' }}
        title={f.name}
      >
        {f.name}
      </span>
    ),
  },
  {
    key: 'relationship',
    label: 'Relationship',
    sortable: true,
    getValue: (f) => f.relationship_type ?? '',
    render: (f) => (
      <span
        className={'text-text-secondary'}
        style={{ letterSpacing: '-0.15px' }}
      >
        {f.relationship_type || '—'}
      </span>
    ),
  },
  // {
  //   key: 'distance',
  //   label: 'Distance (mi)',
  //   align: 'left',
  //   sortable: true,
  //   getValue: (f) => f.distance_miles ?? -1,
  //   render: (f) => (
  //     <span className="text-[#45556C]" style={{ letterSpacing: '-0.15px' }}>
  //       {f.distance_miles ?? 0}
  //     </span>
  //   ),
  // },
  // {
  //   key: 'visits',
  //   label: 'Visits/Yr',
  //   align: 'left',
  //   sortable: true,
  //   getValue: (f) => f.visits_per_year ?? -1,
  //   render: (f) => (
  //     <span className="text-[#45556C]" style={{ letterSpacing: '-0.15px' }}>
  //       {f.visits_per_year ?? 0}
  //     </span>
  //   ),
  // },
  // {
  //   key: 'contacts',
  //   label: 'Contact/Yr',
  //   align: 'left',
  //   sortable: true,
  //   getValue: (f) => f.contacts_per_year ?? -1,
  //   render: (f) => (
  //     <span className="text-[#45556C]" style={{ letterSpacing: '-0.15px' }}>
  //       {f.contacts_per_year ?? 0}
  //     </span>
  //   )
  // },
  {
    key: 'contacted_you',
    label: 'Contacted You',
    align: 'center',
    sortable: true,
    getValue: (f) => f.did_they_contact_you === true ? 1 : 0,
    render: (f) => {
      const isYes = !!f.did_they_contact_you

      return (
        <span
          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold uppercase
        ${isYes
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
            }`}
          style={{ letterSpacing: '-0.15px' }}
        >
          {isYes ? 'YES' : 'NO'}
        </span>
      )
    },
  },
  {
    key: 'invited_you',
    label: 'Invited You',
    align: 'center',
    sortable: true,
    getValue: (f) => f.did_they_invite_you === true ? 1 : 0,
    render: (f) => {
      const isYes = !!f.did_they_invite_you

      return (
        <span
          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold uppercase
        ${isYes
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
            }`}
          style={{ letterSpacing: '-0.15px' }}
        >
          {isYes ? 'YES' : 'NO'}
        </span>
      )
    },
  },
  {
    key: 'made_happy',
    label: 'Made Happy',
    align: 'center',
    sortable: true,
    getValue: (f) => f.made_you_happier === true ? 1 : 0,
    render: (f) => {
      const isYes = !!f.made_you_happier

      return (
        <span
          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold uppercase
        ${isYes
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
            }`}
          style={{ letterSpacing: '-0.15px' }}
        >
          {isYes ? 'YES' : 'NO'}
        </span>
      )
    },
  },
  {
    key: 'miss_them',
    label: 'Miss Them',
    align: 'center',
    sortable: true,
    getValue: (f) => f.do_you_miss_them === true ? 1 : 0,
    render: (f) => {
      const isYes = !!f.do_you_miss_them

      return (
        <span
          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-semibold uppercase
        ${isYes
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
            }`}
          style={{ letterSpacing: '-0.15px' }}
        >
          {isYes ? 'YES' : 'NO'}
        </span>
      )
    },
  },
]


function alignClass(align?: 'left' | 'center' | 'right') {
  if (align === 'center') return 'text-center'
  if (align === 'right') return 'text-right'
  return 'text-left'
}

function SortIcon({
  column,
  sortColumn,
  sortDirection,
}: {
  column: string
  sortColumn: string
  sortDirection: 'asc' | 'desc'
}) {
  if (sortColumn !== column) {
    return <ArrowUpDown className="w-3 h-3 text-[#CAD5E2]" strokeWidth={2} />
  }
  return sortDirection === 'asc' ? (
    <ChevronUp className="w-3 h-3 text-brand-purple" strokeWidth={2} />
  ) : (
    <ChevronDown className="w-3 h-3 text-brand-purple" strokeWidth={2} />
  )
}

interface FriendsTableScreenProps {
  friends: Friend[]
}

export default function FriendsTableScreen({ friends }: FriendsTableScreenProps) {
  const router = useRouter()
  const [sortColumn, setSortColumn] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Recommendation engine state
  const [rankedRecommendations, setRankedRecommendations] = useState<Recommendation[] | null>(null)
  const [recommendationIndex, setRecommendationIndex] = useState(0)

  // Fingerprint of fields used by the engine — triggers recompute when data changes
  const dataFingerprint = useMemo(
    () =>
      friends
        .map((f) => `${f.id}:${f.did_they_invite_you}:${f.made_you_happier}:${f.relationship_type}`)
        .join('|'),
    [friends]
  )

  // Track previous fingerprint to detect changes
  const prevFingerprint = useRef(dataFingerprint)

  useEffect(() => {
    if (prevFingerprint.current !== dataFingerprint) {
      prevFingerprint.current = dataFingerprint
      if (rankedRecommendations !== null) {
        setRankedRecommendations(computeRecommendations(friends))
        setRecommendationIndex(0)
      }
    }
  }, [dataFingerprint, rankedRecommendations, friends])

  const handleRecommendationPress = () => {
    if (rankedRecommendations === null) {
      // First press — compute fresh
      setRankedRecommendations(computeRecommendations(friends))
      setRecommendationIndex(0)
    } else {
      // Subsequent presses — advance index, stay on last
      setRecommendationIndex((i) => Math.min(i + 1, rankedRecommendations.length - 1))
    }
  }

  const currentRecommendation =
    rankedRecommendations !== null ? rankedRecommendations[recommendationIndex] ?? null : null

  const isAtLast =
    rankedRecommendations !== null &&
    recommendationIndex >= rankedRecommendations.length - 1

  const hasStarted = rankedRecommendations !== null

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Sort friends
  const sortedFriends = [...friends].sort((a, b) => {
    const col = COLUMNS.find((c) => c.key === sortColumn)
    if (!col?.getValue) return 0

    const aVal = col.getValue(a)
    const bVal = col.getValue(b)

    if (aVal === null || aVal === -1) return 1
    if (bVal === null || bVal === -1) return -1

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    }

    return 0
  })

  return (
    <>
      {/* Recommendation Engine */}
      <div className="w-full max-w-7xl mb-8">
        {/* Recommendation Card */}
        {hasStarted && (
          <div className="mb-4 rounded-2xl border border-border-light bg-white shadow-md px-5 py-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-brand-purple" strokeWidth={1.67} />
                </div>
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wide text-brand-purple mb-2"
                    style={{ letterSpacing: '0.4px' }}
                  >
                    FriendLens Insight
                  </p>
                  {currentRecommendation ? (
                    <div className="flex flex-col gap-1">
                      <p
                        className="text-sm font-medium text-text-primary leading-relaxed"
                        style={{ letterSpacing: '-0.15px' }}
                      >
                        {currentRecommendation.observation}
                      </p>
                      <p
                        className="text-sm text-text-secondary leading-relaxed"
                        style={{ letterSpacing: '-0.15px' }}
                      >
                        {currentRecommendation.meaning}
                      </p>
                      <p
                        className="text-sm text-brand-purple leading-relaxed"
                        style={{ letterSpacing: '-0.15px' }}
                      >
                        {currentRecommendation.direction}
                      </p>
                    </div>
                  ) : (
                    <p
                      className="text-sm text-text-primary leading-relaxed"
                      style={{ letterSpacing: '-0.15px' }}
                    >
                      Your list looks good — no issues detected.
                    </p>
                  )}
                </div>
              </div>
              {rankedRecommendations && rankedRecommendations.length > 1 && (
                <span className="flex-shrink-0 text-xs text-text-secondary font-medium mt-1">
                  {recommendationIndex + 1} / {rankedRecommendations.length}
                </span>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleRecommendationPress}
          disabled={isAtLast && rankedRecommendations !== null && rankedRecommendations.length <= 1}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors
            ${isAtLast && hasStarted
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-brand-purple text-white hover:bg-brand-purple/90'
            }`}
          style={{ letterSpacing: '-0.15px' }}
        >
          <Lightbulb className="w-4 h-4" strokeWidth={1.67} />
          {!hasStarted
            ? 'Get Recommendation'
            : isAtLast
              ? 'No More Recommendations'
              : 'Next Recommendation'}
        </button>
      </div>
      {/* Friend Table */}
      <div className="w-full max-w-7xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
          <h2
            className="text-xl sm:text-2xl font-semibold leading-8 text-text-primary"
            style={{ letterSpacing: '-0.439px' }}
          >
            Your List
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.push('?step=add&single=true')}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-brand-purple/10 text-brand-purple text-xs sm:text-sm font-semibold leading-5 hover:bg-brand-purple/20 transition-colors"
              style={{ letterSpacing: '-0.15px' }}
            >
              <Plus className="w-4 h-4" strokeWidth={1.33} />
              <span className="hidden sm:inline">Add Person</span>
              <span className="sm:hidden">Add</span>
            </button>
            <button
              onClick={() => router.push('?step=list')}
              className="flex items-center gap-2 px-3 py-2 sm:py-2.5 rounded-xl bg-gray-100 text-[#62748E] text-sm font-medium hover:bg-gray-200 transition-colors"
              title="Back to Your List"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.67} />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full rounded-2xl border border-border-light bg-white shadow-xl overflow-hidden mb-12">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px] sm:min-w-full">
              <thead>
                <tr className="border-b border-border-light bg-bg-muted">
                  {COLUMNS.map((col, i) => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      className={`px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-[#45556C] whitespace-nowrap ${alignClass(col.align)} ${col.sortable ? 'cursor-pointer hover:bg-bg-muted/80 transition-colors' : ''} ${i === 0 ? 'sticky left-0 z-10 bg-bg-muted' : ''}`}
                      style={{ letterSpacing: '-0.15px', minWidth: i === 0 ? '120px' : i === 1 ? '110px' : undefined }}
                    >
                      <div
                        className={`flex items-center gap-1.5 sm:gap-2 ${col.align === 'center' ? 'justify-center' : ''}`}
                      >
                        <span>{col.label}</span>
                        {col.sortable && (
                          <SortIcon
                            column={col.key}
                            sortColumn={sortColumn}
                            sortDirection={sortDirection}
                          />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {sortedFriends.map((friend) => (
                  <tr
                    key={friend.id}
                    className="border-b border-border-lighter last:border-b-0 hover:bg-bg-muted/30 transition-colors"
                  >
                    {COLUMNS.map((col, i) => (
                      <td
                        key={col.key}
                        className={`px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm whitespace-nowrap ${alignClass(col.align)} ${i === 0 ? 'sticky left-0 z-10 bg-white' : ''}`}
                        style={{ letterSpacing: '-0.15px' }}
                      >
                        {col.render(friend)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => router.push('?step=list')}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-text-primary text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
          style={{ letterSpacing: '-0.312px' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 2.5H3.33333C2.8731 2.5 2.5 2.8731 2.5 3.33333V7.5C2.5 7.96024 2.8731 8.33333 3.33333 8.33333H7.5C7.96024 8.33333 8.33333 7.96024 8.33333 7.5V3.33333C8.33333 2.8731 7.96024 2.5 7.5 2.5Z" stroke="#0F172B" strokeWidth="1.66667" strokeLinecap="round" stroke-linejoin="round" />
            <path d="M7.5 11.666H3.33333C2.8731 11.666 2.5 12.0391 2.5 12.4993V16.666C2.5 17.1263 2.8731 17.4993 3.33333 17.4993H7.5C7.96024 17.4993 8.33333 17.1263 8.33333 16.666V12.4993C8.33333 12.0391 7.96024 11.666 7.5 11.666Z" stroke="#0F172B" strokeWidth="1.66667" strokeLinecap="round" stroke-linejoin="round" />
            <path d="M11.667 3.33398H17.5003" stroke="#0F172B" strokeWidth="1.66667" strokeLinecap="round" stroke-linejoin="round" />
            <path d="M11.667 7.5H17.5003" stroke="#0F172B" strokeWidth="1.66667" strokeLinecap="round" stroke-linejoin="round" />
            <path d="M11.667 12.5H17.5003" stroke="#0F172B" strokeWidth="1.66667" strokeLinecap="round" stroke-linejoin="round" />
            <path d="M11.667 16.666H17.5003" stroke="#0F172B" strokeWidth="1.66667" strokeLinecap="round" stroke-linejoin="round" />
          </svg>

          Back to List
        </button>
      </div>
    </>
  )
}
