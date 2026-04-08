'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronRight, Plus, LayoutGrid, Lightbulb } from 'lucide-react'
import { addFriend } from '../actions'
import type { Friend } from '../types'
import EditFriendModal from './EditFriendModal'
import { computeRecommendations, type Recommendation } from './recommendationEngine'

interface FriendsListScreenProps {
  friends: Friend[]
}

export default function FriendsListScreen({ friends }: FriendsListScreenProps) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showAddInput, setShowAddInput] = useState(false)
  const [newName, setNewName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [editFriend, setEditFriend] = useState<Friend | null>(null)
  const [rankedRecommendations, setRankedRecommendations] = useState<Recommendation[] | null>(null)
  const [recommendationIndex, setRecommendationIndex] = useState(0)

  const hasStarted = rankedRecommendations !== null
  const currentRecommendation = hasStarted ? rankedRecommendations[recommendationIndex] ?? null : null
  const isAtLast = hasStarted && recommendationIndex >= rankedRecommendations.length - 1

  function handleRecommendationPress() {
    if (!hasStarted) {
      setRankedRecommendations(computeRecommendations(friends))
      setRecommendationIndex(0)
    } else {
      setRecommendationIndex((i) => Math.min(i + 1, rankedRecommendations!.length - 1))
    }
  }

  async function handleAddFriend() {
    const trimmed = newName.trim()
    if (!trimmed) return

    setIsAdding(true)
    try {
      const result = await addFriend(trimmed)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(`${trimmed} added!`)
      setNewName('')
      setShowAddInput(false)
      router.refresh()
      if (result.friend) {
        setEditFriend(result.friend)
      }
    } finally {
      setIsAdding(false)
    }
  }

  function handleCardClick(friend: Friend) {
    setSelectedId((prev) => (prev === friend.id ? null : friend.id))
  }

  function getInitial(name: string) {
    return name.charAt(0).toUpperCase()
  }

  return (
    <>
      <div className="w-full max-w-[768px]">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-2xl font-semibold leading-8 text-[#0F172B]"
            style={{ letterSpacing: '-0.439px' }}
          >
            Your List
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRecommendationPress}
              disabled={isAtLast && hasStarted}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold leading-5 transition-colors ${
                isAtLast && hasStarted
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'recommendation-pulse bg-brand-purple text-white hover:bg-brand-purple/90'
              }`}
              style={{ letterSpacing: '-0.15px' }}
            >
              <Lightbulb className="w-4 h-4" strokeWidth={1.67} />
              {!hasStarted ? 'Get Recommendation' : isAtLast ? 'No More' : 'Next Recommendation'}
            </button>
            <button
              onClick={() => setShowAddInput((v) => !v)}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-purple-100 text-purple-600 text-sm font-semibold leading-5 hover:bg-purple-200 transition-colors"
              style={{ letterSpacing: '-0.15px' }}
            >
              <Plus className="w-4 h-4" strokeWidth={1.33} />
              Add Person
            </button>
            <button
              onClick={() => router.push('?step=table')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-[#62748E] text-sm font-medium hover:bg-gray-200 transition-colors"
              title="View detailed table"
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={1.67} />
            </button>
          </div>
        </div>

        {/* Recommendation insight card */}
        {hasStarted && (
          <div className="mb-4 rounded-2xl border border-purple-100 bg-white shadow-md px-5 py-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-brand-purple" strokeWidth={1.67} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-purple mb-1" style={{ letterSpacing: '0.4px' }}>
                    FriendLens Insight
                  </p>
                  {currentRecommendation?.type === 'fallback' && (
                    <p className="text-xs text-[#62748E] mb-2" style={{ letterSpacing: '-0.1px' }}>
                      {currentRecommendation.title}
                    </p>
                  )}
                  {currentRecommendation ? (
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-[#0F172B] leading-relaxed" style={{ letterSpacing: '-0.15px' }}>
                        {currentRecommendation.observation}
                      </p>
                      <p className="text-sm text-[#62748E] leading-relaxed" style={{ letterSpacing: '-0.15px' }}>
                        {currentRecommendation.meaning}
                      </p>
                      <p className="text-sm text-brand-purple leading-relaxed" style={{ letterSpacing: '-0.15px' }}>
                        {currentRecommendation.direction}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-[#0F172B] leading-relaxed" style={{ letterSpacing: '-0.15px' }}>
                      Your list looks good — no issues detected.
                    </p>
                  )}
                </div>
              </div>
              {rankedRecommendations && rankedRecommendations.length > 1 && (
                <span className="flex-shrink-0 text-xs text-[#62748E] font-medium mt-1">
                  {recommendationIndex + 1} / {rankedRecommendations.length}
                </span>
              )}
            </div>
          </div>
        )}

        {showAddInput && (
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddFriend()
                if (e.key === 'Escape') {
                  setShowAddInput(false)
                  setNewName('')
                }
              }}
              placeholder="Friend's name"
              autoFocus
              className="flex-1 h-14 px-5 rounded-xl border border-gray-200 bg-white text-base font-normal leading-6 text-[#0F172B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              style={{ letterSpacing: '-0.312px' }}
            />

            <button
              type="button"
              disabled={!newName.trim() || isAdding}
              onClick={handleAddFriend}
              className="px-6 h-14 rounded-[14px] bg-gradient-to-r from-[#9810FA] to-[#C800DE] text-white font-semibold transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? 'Adding...' : 'Add'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAddInput(false)
                setNewName('')
              }}
              className="px-6 h-14 rounded-xl text-[#90A1B9] font-medium transition-all hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3 mb-12 mt-2">
          {friends.map((friend) => {
            const isSelected = selectedId === friend.id
            const badge = friend.relationship_type || 'Friend'

            return (
              <div
                key={friend.id}
                onClick={() => handleCardClick(friend)}
                className={`flex items-center justify-between px-4 h-20 rounded-2xl border transition-all cursor-pointer ${isSelected
                  ? 'border-purple-400 bg-white shadow-[0_4px_20px_0_rgba(143,63,255,0.25)]'
                  : 'border-gray-200 bg-white/50 hover:bg-white hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-b from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                    <span
                      className="text-white text-sm font-bold leading-5"
                      style={{ letterSpacing: '-0.15px' }}
                    >
                      {getInitial(friend.name)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditFriend(friend)
                      }}
                      className="text-lg font-semibold leading-[22.5px] text-[#0F172B] capitalize hover:text-purple-600 transition-colors cursor-pointer"
                      style={{ letterSpacing: '-0.439px' }}
                    >
                      {friend.name}
                    </h3>
                    <p
                      className="text-sm font-normal leading-5 text-[#62748E]"
                      style={{ letterSpacing: '-0.15px' }}
                    >
                      {badge}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditFriend(friend)
                      }}
                      className="text-purple-600 text-sm font-semibold leading-5 hover:opacity-80 transition-opacity"
                      style={{ letterSpacing: '-0.15px' }}
                    >
                      Edit Details
                    </button>
                  )}
                  <ChevronRight
                    className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-purple-400'
                      }`}
                    strokeWidth={1.67}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => router.push('?step=table')}
            className="flex items-center gap-2 px-8 h-14 rounded-[14px] bg-gradient-to-b from-purple-500 to-indigo-600 text-white text-base font-semibold leading-6 shadow-[0_20px_25px_-5px_rgba(89,22,139,0.2),0_8px_10px_-6px_rgba(89,22,139,0.2)] hover:shadow-[0_25px_35px_-5px_rgba(89,22,139,0.3),0_10px_15px_-6px_rgba(89,22,139,0.3)] transition-shadow"
            style={{ letterSpacing: '-0.312px' }}
          >
            <LayoutGrid className="w-5 h-5" strokeWidth={1.67} />
            View Your Friends
          </button>
        </div>
      </div>

      {/* Edit modal */}
      {editFriend && (
        <EditFriendModal
          open={!!editFriend}
          friend={editFriend}
          onClose={() => setEditFriend(null)}
          onSaved={() => router.refresh()}
          onDeleted={() => router.refresh()}
        />
      )}
    </>
  )
}