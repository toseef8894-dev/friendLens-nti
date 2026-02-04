'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { updateFriend } from '../actions'
import type { Friend } from '../types'
import FriendTypesModal from './FriendTypesModal'

const FRIEND_TYPES = [
  { label: 'Best Friend', value: 'Best Friend' },
  { label: 'Close Friend', value: 'Close Friend' },
  { label: 'Friend', value: 'Friend' },
  { label: 'Buddy', value: 'Buddy' },
  { label: 'Emerging Friend', value: 'Emerging Friend' },
  { label: 'Old Friend', value: 'Old Friend' },
  { label: 'Remote Friend', value: 'Remote Friend' },
  { label: 'Activity Friend', value: 'Activity Friend' },
  { label: 'Work Friend', value: 'Work Friend' },
]

interface EditFriendModalProps {
  open: boolean
  onClose: () => void
  friend: Friend
  onSaved?: (updated: Friend) => void
}

function ReflectionToggle({
  question,
  value,
  onChange,
}: {
  question: string
  value: boolean | null
  onChange: (val: boolean) => void
}) {
  const isYes = value === true
  const isNo = value === false

  return (
    <div className="flex items-center justify-between px-6 py-5 bg-white rounded-2xl border border-gray-100">
      <p
        className="text-sm font-medium text-[#314158] flex-1 pr-4"
        style={{ letterSpacing: '-0.15px' }}
      >
        {question}
      </p>

      {/* Segmented control */}
      <div className="flex items-center bg-gray-100 rounded-xl p-1">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={[
            'px-6 py-2 rounded-xl text-sm font-semibold transition-all min-w-[64px]',
            isYes
              ? 'bg-white text-[#0F172B] shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          ].join(' ')}
          style={{ letterSpacing: '-0.15px' }}
        >
          Yes
        </button>

        <button
          type="button"
          onClick={() => onChange(false)}
          className={[
            'px-6 py-2 rounded-xl text-sm font-semibold transition-all min-w-[64px]',
            isNo
              ? 'bg-white text-[#0F172B] shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          ].join(' ')}
          style={{ letterSpacing: '-0.15px' }}
        >
          No
        </button>
      </div>
    </div>
  )
}

export default function EditFriendModal({
  open,
  onClose,
  friend,
  onSaved,
}: EditFriendModalProps) {
  const [selectedType, setSelectedType] = useState(friend.relationship_type ?? 'Friend')
  const [showDropdown, setShowDropdown] = useState(false)
  const [metrics, setMetrics] = useState({
    distance: friend.distance_miles?.toString() ?? '',
    visits: friend.visits_per_year?.toString() ?? '',
    contacts: friend.contacts_per_year?.toString() ?? '',
  })
  const [reflection, setReflection] = useState({
    contactedYou: friend.did_they_contact_you,
    invitedYou: friend.did_they_invite_you,
    madeHappy: friend.made_you_happier,
    missThem: friend.do_you_miss_them,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showFriendTypesModal, setShowFriendTypesModal] = useState(false)

  // Reset form when friend prop changes
  useEffect(() => {
    setSelectedType(friend.relationship_type ?? 'Friend')
    setMetrics({
      distance: friend.distance_miles?.toString() ?? '',
      visits: friend.visits_per_year?.toString() ?? '',
      contacts: friend.contacts_per_year?.toString() ?? '',
    })
    setReflection({
      contactedYou: friend.did_they_contact_you,
      invitedYou: friend.did_they_invite_you,
      madeHappy: friend.made_you_happier,
      missThem: friend.do_you_miss_them,
    })
    setShowDropdown(false)
  }, [friend])

  function parseNum(v: string): number | null {
    const trimmed = v.trim()
    if (trimmed === '') return null
    const n = Number(trimmed)
    return Number.isFinite(n) && n >= 0 ? n : null
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      const payload: Record<string, unknown> = {
        relationship_type: selectedType || null,
        distance_miles: parseNum(metrics.distance),
        visits_per_year: parseNum(metrics.visits),
        contacts_per_year: parseNum(metrics.contacts),
        did_they_contact_you: reflection.contactedYou,
        did_they_invite_you: reflection.invitedYou,
        made_you_happier: reflection.madeHappy,
        do_you_miss_them: reflection.missThem,
      }

      const result = await updateFriend(friend.id, payload)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Friend updated!')

      if (onSaved) {
        onSaved({
          ...friend,
          relationship_type: selectedType || null,
          distance_miles: parseNum(metrics.distance),
          visits_per_year: parseNum(metrics.visits),
          contacts_per_year: parseNum(metrics.contacts),
          did_they_contact_you: reflection.contactedYou,
          did_they_invite_you: reflection.invitedYou,
          made_you_happier: reflection.madeHappy,
          do_you_miss_them: reflection.missThem,
        })
      }

      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-8 pb-4 border-b border-gray-100">
          <div>
            <h2
              className="text-2xl font-bold text-[#0F172B] mb-1 capitalize"
              style={{ letterSpacing: '-0.439px' }}
            >
              Edit Details: {friend.name}
            </h2>
            <p
              className="text-sm font-normal text-[#62748E]"
              style={{ letterSpacing: '-0.15px' }}
            >
              Enrich your relationship data
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-400" strokeWidth={1.67} />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto flex-1 p-8">
          {/* Name Field */}
          <div className="mb-8">
            <label
              className="block text-sm font-semibold text-[#0F172B] mb-3"
              style={{ letterSpacing: '-0.15px' }}
            >
              Name
            </label>
            <input
              type="text"
              value={friend.name}
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-[#0F172B] font-normal text-sm focus:outline-none capitalize"
              style={{ letterSpacing: '-0.312px' }}
            />
          </div>

          {/* Relationship Type Dropdown */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label
                className="block text-sm font-semibold text-[#314158]"
                style={{ letterSpacing: '-0.15px' }}
              >
                Relationship Type
              </label>
              <button
                type="button"
                onClick={() => setShowFriendTypesModal(true)}
                className="bg-gradient-to-r from-[#9810FA] to-[#C800DE] bg-clip-text text-transparent text-sm font-semibold hover:opacity-80 transition-opacity"
                style={{ letterSpacing: '-0.15px' }}
              >
                More
              </button>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full px-4 py-3 rounded-xl border border-purple-300 bg-white text-[#0F172B] font-medium text-sm text-left flex items-center justify-between hover:border-purple-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                style={{ letterSpacing: '-0.312px' }}
              >
                <span>
                  {FRIEND_TYPES.find((t) => t.value === selectedType)?.label || 'Friend'}
                </span>
                {showDropdown ? (
                  <ChevronUp className="w-4 h-4 text-[#62748E]" strokeWidth={1.33} />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#62748E]" strokeWidth={1.33} />
                )}
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl z-10 max-h-64 overflow-y-auto">
                  {FRIEND_TYPES.map((type, index) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setSelectedType(type.value)
                        setShowDropdown(false)
                      }}
                      className={`w-full px-4 py-3 text-left text-sm font-semibold transition-colors ${selectedType === type.value
                        ? 'bg-purple-100 text-purple-600'
                        : 'text-[#62748E] hover:bg-gray-50'
                        } ${index !== FRIEND_TYPES.length - 1 ? 'border-b border-gray-100' : ''}`}
                      style={{ letterSpacing: '0.07px' }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interaction Metrics */}
          <div className="mb-8">
            <h3
              className="text-sm font-bold uppercase text-[#0F172B] mb-1 flex items-center gap-3"
              style={{ letterSpacing: '0.2px' }}
            >
              Interaction Metrics
              <span
                className="text-xs font-normal text-gray-400 normal-case"
                style={{ letterSpacing: '0.467px' }}
              >
                (Est. per year)
              </span>
            </h3>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label
                  className="block text-xs font-normal text-[#62748E] mb-2"
                  style={{ letterSpacing: '-0.15px' }}
                >
                  Distance (miles)
                </label>
                <input
                  type="number"
                  value={metrics.distance}
                  onChange={(e) => setMetrics({ ...metrics, distance: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-[#0F172B] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-transparent"
                  style={{ letterSpacing: '-0.312px' }}
                />
              </div>
              <div>
                <label
                  className="block text-xs font-normal text-[#62748E] mb-2"
                  style={{ letterSpacing: '-0.15px' }}
                >
                  Visits
                </label>
                <input
                  type="number"
                  value={metrics.visits}
                  onChange={(e) => setMetrics({ ...metrics, visits: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-[#0F172B] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-transparent"
                  style={{ letterSpacing: '-0.312px' }}
                />
              </div>
              <div>
                <label
                  className="block text-xs font-normal text-[#62748E] mb-2"
                  style={{ letterSpacing: '-0.15px' }}
                >
                  Contacts (calls/texts)
                </label>
                <input
                  type="number"
                  value={metrics.contacts}
                  onChange={(e) => setMetrics({ ...metrics, contacts: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-[#0F172B] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-transparent"
                  style={{ letterSpacing: '-0.312px' }}
                />
              </div>
            </div>
          </div>

          {/* Reflection Section */}
          <div className="mb-6">
            <h3
              className="text-sm font-bold uppercase text-[#0F172B] mb-4"
              style={{ letterSpacing: '0.2px' }}
            >
              Reflection
            </h3>
            <div className="bg-white border-gray-200 shadow-sm space-y-4 overflow-hidden">
              <ReflectionToggle
                question="Did they contact you?"
                value={reflection.contactedYou}
                onChange={(val) => setReflection({ ...reflection, contactedYou: val })}
              />
              <ReflectionToggle
                question="Did they invite you?"
                value={reflection.invitedYou}
                onChange={(val) => setReflection({ ...reflection, invitedYou: val })}
              />
              <ReflectionToggle
                question="Do they make you happier?"
                value={reflection.madeHappy}
                onChange={(val) => setReflection({ ...reflection, madeHappy: val })}
              />
              <ReflectionToggle
                question="Do you miss them?"
                value={reflection.missThem}
                onChange={(val) => setReflection({ ...reflection, missThem: val })}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-8 pt-4 border-t border-gray-100 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-[#0F172B] font-semibold text-base hover:bg-gray-100 transition-colors"
            style={{ letterSpacing: '-0.312px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ letterSpacing: '-0.312px' }}
          >
            {isSaving ? 'Saving...' : 'Save Details'}
          </button>
        </div>
      </div>

      {/* Friend Types Modal */}
      <FriendTypesModal
        isOpen={showFriendTypesModal}
        onClose={() => setShowFriendTypesModal(false)}
        onSelect={(type) => {
          setSelectedType(type)
          setShowFriendTypesModal(false)
        }}
        selectedType={selectedType}
      />
    </div>
  )
}
