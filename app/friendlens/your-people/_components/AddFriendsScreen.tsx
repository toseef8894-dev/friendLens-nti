'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { createFriends } from '../actions'

const MIN_ROWS = 3

interface AddFriendsScreenProps {
  single?: boolean
}

export default function AddFriendsScreen({ single = false }: AddFriendsScreenProps) {
  const router = useRouter()
  const [friends, setFriends] = useState<string[]>(Array(single ? 1 : MIN_ROWS).fill(''))
  const [isPending, setIsPending] = useState(false)

  const hasAnyFriend = friends.some((f) => f.trim() !== '')

  function handleFriendChange(index: number, value: string) {
    const newFriends = [...friends]
    newFriends[index] = value
    setFriends(newFriends)
  }

  function handleAddAnother() {
    setFriends([...friends, ''])
  }

  async function handleContinue() {
    if (!hasAnyFriend) return

    setIsPending(true)
    try {
      const result = await createFriends(friends)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Friends added!')
      router.push('?step=list')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="w-full max-w-[494px] bg-white rounded-2xl shadow-xl p-6 sm:p-8">
      <div className="mb-6">
        <h2
          className="text-lg font-semibold leading-7 text-[#0F172B] mb-1"
          style={{ letterSpacing: '-0.439px' }}
        >
          Add your friends' names or nicknames
        </h2>
        <p
          className="text-sm font-normal leading-5 text-[#62748E]"
          style={{ letterSpacing: '-0.15px' }}
        >
          Start with a few people close to you.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        {friends.map((friend, index) => (
          <input
            key={index}
            type="text"
            value={friend}
            onChange={(e) => handleFriendChange(index, e.target.value)}
            placeholder={`Friend #${index + 1}`}
            className="w-full h-14 px-5 rounded-xl border border-gray-200 bg-white text-base font-normal leading-6 text-[#0F172B] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            style={{ letterSpacing: '-0.312px' }}
          />
        ))}
      </div>

      <button
        onClick={handleAddAnother}
        className="flex items-center gap-2 mb-8 text-purple-600 text-sm font-semibold leading-5 hover:opacity-80 transition-opacity"
        style={{ letterSpacing: '-0.15px' }}
      >
        <Plus className="w-4 h-4" strokeWidth={1.33} />
        Add another
      </button>

      <button
        onClick={handleContinue}
        disabled={!hasAnyFriend || isPending}
        className={`w-full h-[60px] rounded-[14px] text-white text-lg font-bold leading-7 transition-all ${hasAnyFriend && !isPending
          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_10px_15px_-3px_rgba(152,16,250,0.2),0_4px_6px_-4px_rgba(152,16,250,0.2)] hover:shadow-[0_20px_25px_-5px_rgba(152,16,250,0.3),0_10px_10px_-5px_rgba(152,16,250,0.3)]'
          : 'bg-purple-400 cursor-not-allowed'
          }`}
        style={{ letterSpacing: '-0.439px' }}
      >
        {isPending ? 'Saving...' : 'Continue'}
      </button>
    </div>
  )
}