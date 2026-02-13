'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown, Plus, ArrowUpDown, ArrowLeft } from 'lucide-react'
import type { Friend } from '../types'

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
    render: (f) => {
      const display = f.name.length > 30 ? f.name.slice(0, 30) + '…' : f.name
      return (
        <span
          className="font-medium text-text-primary block truncate"
          style={{ letterSpacing: '-0.15px', textTransform: 'capitalize' }}
          title={f.name}
        >
          {display}
        </span>
      )
    },
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
  {
    key: 'distance',
    label: 'Distance (mi)',
    align: 'left',
    sortable: true,
    getValue: (f) => f.distance_miles ?? -1,
    render: (f) => (
      <span className="text-[#45556C]" style={{ letterSpacing: '-0.15px' }}>
        {f.distance_miles ?? 0}
      </span>
    ),
  },
  {
    key: 'visits',
    label: 'Visits/Yr',
    align: 'left',
    sortable: true,
    getValue: (f) => f.visits_per_year ?? -1,
    render: (f) => (
      <span className="text-[#45556C]" style={{ letterSpacing: '-0.15px' }}>
        {f.visits_per_year ?? 0}
      </span>
    ),
  },
  {
    key: 'contacts',
    label: 'Contact/Yr',
    align: 'left',
    sortable: true,
    getValue: (f) => f.contacts_per_year ?? -1,
    render: (f) => (
      <span className="text-[#45556C]" style={{ letterSpacing: '-0.15px' }}>
        {f.contacts_per_year ?? 0}
      </span>
    )
  },
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
      {/* Friend Table */}
      <div className="w-full max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-2xl font-semibold leading-8 text-text-primary"
            style={{ letterSpacing: '-0.439px' }}
          >
            Your List
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('?step=add&single=true')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-purple/10 text-brand-purple text-sm font-semibold leading-5 hover:bg-brand-purple/20 transition-colors"
              style={{ letterSpacing: '-0.15px' }}
            >
              <Plus className="w-4 h-4" strokeWidth={1.33} />
              Add Person
            </button>
            <button
              onClick={() => router.push('?step=list')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-100 text-[#62748E] text-sm font-medium hover:bg-gray-200 transition-colors"
              title="Back to Your List"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.67} />
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="w-full rounded-2xl border border-border-light bg-white shadow-xl overflow-hidden mb-12">
          <div className="w-full">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="border-b border-border-light bg-bg-muted">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      className={`px-4 py-3.5 text-sm font-semibold text-[#45556C] whitespace-nowrap ${alignClass(col.align)} ${col.sortable ? 'cursor-pointer hover:bg-bg-muted/80 transition-colors' : ''}`}
                      style={{ letterSpacing: '-0.15px' }}
                    >
                      <div
                        className={`flex items-center gap-2 ${col.align === 'center' ? 'justify-center' : ''}`}
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
                    {COLUMNS.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-4 text-sm whitespace-nowrap ${alignClass(col.align)}`}
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
            <path d="M7.5 2.5H3.33333C2.8731 2.5 2.5 2.8731 2.5 3.33333V7.5C2.5 7.96024 2.8731 8.33333 3.33333 8.33333H7.5C7.96024 8.33333 8.33333 7.96024 8.33333 7.5V3.33333C8.33333 2.8731 7.96024 2.5 7.5 2.5Z" stroke="#0F172B" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M7.5 11.666H3.33333C2.8731 11.666 2.5 12.0391 2.5 12.4993V16.666C2.5 17.1263 2.8731 17.4993 3.33333 17.4993H7.5C7.96024 17.4993 8.33333 17.1263 8.33333 16.666V12.4993C8.33333 12.0391 7.96024 11.666 7.5 11.666Z" stroke="#0F172B" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M11.667 3.33398H17.5003" stroke="#0F172B" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M11.667 7.5H17.5003" stroke="#0F172B" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M11.667 12.5H17.5003" stroke="#0F172B" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M11.667 16.666H17.5003" stroke="#0F172B" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
          </svg>

          Back to List
        </button>
      </div>
    </>
  )
}
