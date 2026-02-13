'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { X, Check } from 'lucide-react'
import { linkFriendToSource, unlinkFriendFromSource, getFriendsForSource } from '../actions'
import type { Friend } from '../../your-people/types'

interface LinkPeopleModalProps {
  open: boolean
  onClose: () => void
  sourceId: string
  sourceName: string
  allFriends: Friend[]
  onChanged?: () => void
}

export default function LinkPeopleModal({
  open,
  onClose,
  sourceId,
  sourceName,
  allFriends,
  onChanged,
}: LinkPeopleModalProps) {
  const [linkedIds, setLinkedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    async function load() {
      setLoading(true)
      const result = await getFriendsForSource(sourceId)
      if (result.friendIds) {
        setLinkedIds(new Set(result.friendIds))
      }
      setLoading(false)
    }

    load()
  }, [open, sourceId])

  async function handleToggle(friendId: string) {
    setToggling(friendId)
    const isLinked = linkedIds.has(friendId)

    try {
      if (isLinked) {
        const result = await unlinkFriendFromSource(friendId, sourceId)
        if (result.error) {
          toast.error(result.error)
          return
        }
        setLinkedIds((prev) => {
          const next = new Set(prev)
          next.delete(friendId)
          return next
        })
      } else {
        const result = await linkFriendToSource(friendId, sourceId)
        if (result.error) {
          toast.error(result.error)
          return
        }
        setLinkedIds((prev) => new Set(prev).add(friendId))
      }
      if (onChanged) onChanged()
    } finally {
      setToggling(null)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h2
              className="text-xl font-bold text-[#0F172B] mb-1"
              style={{ letterSpacing: '-0.439px' }}
            >
              Link People
            </h2>
            <p
              className="text-sm font-normal text-[#62748E]"
              style={{ letterSpacing: '-0.15px' }}
            >
              Select people from &ldquo;{sourceName}&rdquo;
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-400" strokeWidth={1.67} />
          </button>
        </div>

        {/* People List */}
        <div className="overflow-y-auto flex-1 p-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-[#62748E]">Loading...</p>
            </div>
          ) : allFriends.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-[#62748E]">
                No people added yet. Add people in &ldquo;Your People&rdquo; first.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {allFriends.map((friend) => {
                const isLinked = linkedIds.has(friend.id)
                const isToggling = toggling === friend.id

                return (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => handleToggle(friend.id)}
                    disabled={isToggling}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                      isLinked
                        ? 'bg-purple-50 hover:bg-purple-100'
                        : 'hover:bg-gray-50'
                    } ${isToggling ? 'opacity-50' : ''}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isLinked
                          ? 'bg-[#9810FA] border-[#9810FA]'
                          : 'border-gray-300'
                      }`}
                    >
                      {isLinked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium text-[#0F172B] truncate capitalize"
                        style={{ letterSpacing: '-0.15px' }}
                      >
                        {friend.name}
                      </p>
                      {friend.relationship_type && (
                        <p
                          className="text-xs text-[#62748E] truncate"
                          style={{ letterSpacing: '-0.15px' }}
                        >
                          {friend.relationship_type}
                        </p>
                      )}
                    </div>
                    {isLinked && friend.did_they_invite_you && friend.did_they_contact_you && (
                      <span className="text-xs font-medium text-[#17AA46] bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">
                        Reciprocal
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition-shadow"
            style={{ letterSpacing: '-0.312px' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
