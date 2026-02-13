'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { updateSource, deleteSource } from '../actions'
import { SOURCE_TYPES } from '../types'
import type { SourceWithSignal } from '../types'

interface EditSourceModalProps {
  open: boolean
  onClose: () => void
  source: SourceWithSignal
  onSaved?: (updated: SourceWithSignal) => void
  onDeleted?: () => void
  onManagePeople?: () => void
}

export default function EditSourceModal({
  open,
  onClose,
  source,
  onSaved,
  onDeleted,
  onManagePeople,
}: EditSourceModalProps) {
  const [editName, setEditName] = useState(source.name)
  const [selectedType, setSelectedType] = useState(source.source_type ?? '')
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeMembers, setActiveMembers] = useState(source.active_members?.toString() ?? '')
  const [relevantPct, setRelevantPct] = useState(source.relevant_pct?.toString() ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setEditName(source.name)
    setSelectedType(source.source_type ?? '')
    setActiveMembers(source.active_members?.toString() ?? '')
    setRelevantPct(source.relevant_pct?.toString() ?? '')
    setShowDropdown(false)
  }, [source])

  function parseNum(v: string): number | null {
    const trimmed = v.trim()
    if (trimmed === '') return null
    const n = Number(trimmed)
    return Number.isFinite(n) && n >= 0 ? n : null
  }

  async function handleSave() {
    const trimmedName = editName.trim()
    if (!trimmedName) {
      toast.error('Name cannot be empty.')
      return
    }

    setIsSaving(true)
    try {
      const payload: Record<string, unknown> = {
        name: trimmedName,
        source_type: selectedType || null,
        active_members: parseNum(activeMembers),
        relevant_pct: parseNum(relevantPct),
      }

      const result = await updateSource(source.id, payload)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Source updated!')

      if (onSaved) {
        onSaved({
          ...source,
          name: trimmedName,
          source_type: selectedType || null,
          active_members: parseNum(activeMembers),
          relevant_pct: parseNum(relevantPct),
        })
      }

      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove "${source.name}" from your sources?`)) return

    setIsDeleting(true)
    try {
      const result = await deleteSource(source.id)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success(`"${source.name}" removed.`)
      onClose()
      if (onDeleted) onDeleted()
    } finally {
      setIsDeleting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-8 pb-4 border-b border-gray-100">
          <div>
            <h2
              className="text-2xl font-bold text-[#0F172B] mb-1"
              style={{ letterSpacing: '-0.439px' }}
            >
              Edit Source
            </h2>
            <p
              className="text-sm font-normal text-[#62748E]"
              style={{ letterSpacing: '-0.15px' }}
            >
              Update your source details
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
          <div className="mb-6">
            <label
              className="block text-sm font-semibold text-[#0F172B] mb-3"
              style={{ letterSpacing: '-0.15px' }}
            >
              Source Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#0F172B] font-normal text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-transparent"
              style={{ letterSpacing: '-0.312px' }}
            />
          </div>

          {/* Source Type Dropdown */}
          <div className="mb-6">
            <label
              className="block text-sm font-semibold text-[#314158] mb-3"
              style={{ letterSpacing: '-0.15px' }}
            >
              Source Type
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full px-4 py-3 rounded-xl border border-purple-300 bg-white text-[#0F172B] font-medium text-sm text-left flex items-center justify-between hover:border-purple-400 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                style={{ letterSpacing: '-0.312px' }}
              >
                <span className={!selectedType ? 'text-gray-400' : ''}>
                  {selectedType || 'Select Source Type'}
                </span>
                {showDropdown ? (
                  <ChevronUp className="w-4 h-4 text-[#62748E]" strokeWidth={1.33} />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#62748E]" strokeWidth={1.33} />
                )}
              </button>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-xl z-10 max-h-64 overflow-y-auto">
                  {SOURCE_TYPES.map((type, index) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSelectedType(type)
                        setShowDropdown(false)
                      }}
                      className={`w-full px-4 py-3 text-left text-sm font-semibold transition-colors ${
                        selectedType === type
                          ? 'bg-purple-100 text-purple-600'
                          : 'text-[#62748E] hover:bg-gray-50'
                      } ${index !== SOURCE_TYPES.length - 1 ? 'border-b border-gray-100' : ''}`}
                      style={{ letterSpacing: '0.07px' }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="mb-6">
            <h3
              className="text-sm font-bold uppercase text-[#0F172B] mb-4"
              style={{ letterSpacing: '0.2px' }}
            >
              Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs font-normal text-[#62748E] mb-2"
                  style={{ letterSpacing: '-0.15px' }}
                >
                  Active Members
                </label>
                <input
                  type="number"
                  value={activeMembers}
                  onChange={(e) => setActiveMembers(e.target.value)}
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
                  Relevant %
                </label>
                <input
                  type="number"
                  value={relevantPct}
                  onChange={(e) => setRelevantPct(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-[#0F172B] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-transparent"
                  style={{ letterSpacing: '-0.312px' }}
                />
              </div>
            </div>
          </div>

          {/* Linked People Summary */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3
                className="text-sm font-bold uppercase text-[#0F172B]"
                style={{ letterSpacing: '0.2px' }}
              >
                Linked People
              </h3>
              <button
                type="button"
                onClick={onManagePeople}
                className="bg-gradient-to-r from-[#9810FA] to-[#C800DE] bg-clip-text text-transparent text-sm font-semibold hover:opacity-80 transition-opacity"
                style={{ letterSpacing: '-0.15px' }}
              >
                Manage
              </button>
            </div>
            <div className="px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <p className="text-sm text-[#45556C]" style={{ letterSpacing: '-0.15px' }}>
                {source.associated_people_count} {source.associated_people_count === 1 ? 'person' : 'people'} linked
                {source.reciprocal_count > 0 && (
                  <span className="text-[#17AA46] font-medium">
                    {' '}({source.reciprocal_count} reciprocal)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-8 pt-4 border-t border-gray-100 bg-white">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-3 rounded-xl text-red-600 font-semibold text-sm border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ letterSpacing: '-0.15px' }}
          >
            {isDeleting ? 'Removing...' : 'Remove Source'}
          </button>
          <div className="flex items-center gap-3">
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
      </div>
    </div>
  )
}
