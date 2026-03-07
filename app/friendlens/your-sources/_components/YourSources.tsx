'use client'

import { useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { ChevronUp, ChevronDown, ArrowUpDown, Plus } from 'lucide-react'
import { createSource, getSourcesWithSignal } from '../actions'
import { SOURCE_TYPES } from '../types'
import type { SourceWithSignal, Signal } from '../types'
import type { Friend } from '../../your-people/types'
import EditSourceModal from './EditSourceModal'
import LinkPeopleModal from './LinkPeopleModal'

// ── Signal config ────────────────────────────────────────────

const SIGNAL_CONFIG: Record<Signal, { color: string; label: string }> = {
    high: { color: '#22C55E', label: 'Higher' },
    medium: { color: '#F59E0B', label: 'Medium' },
    low: { color: '#FB7185', label: 'Lower' },
}

const SIGNAL_SORT_ORDER: Record<Signal, number> = { high: 3, medium: 2, low: 1 }

const SIGNAL_PILL_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    high: { bg: '#F0FDF4', text: '#166534', border: '#86EFAC' },
    medium: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
    low: { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
}
const SIGNAL_PILL_DEFAULT = { bg: '#EEF2FF', text: '#3730A3', border: '#C7D2FE' }

// ── Column definition ────────────────────────────────────────

interface Column {
    key: string
    label: string
    tooltip?: string
    render: (s: SourceWithSignal) => React.ReactNode
    align?: 'left' | 'center'
    sortable?: boolean
    getValue?: (s: SourceWithSignal) => string | number
}

const COLUMNS: Column[] = [
    {
        key: 'name',
        label: 'Source or Potential Source',
        tooltip: 'Name a current or past source',
        sortable: true,
        getValue: (s) => s.name.toLowerCase(),
        render: (s) => (
            <span
                className="font-medium text-[#0F172B] block truncate max-w-[100px] sm:max-w-[180px]"
                style={{ letterSpacing: '-0.15px' }}
                title={s.name}
            >
                {s.name}
            </span>
        ),
    },
    {
        key: 'active_members',
        label: 'Active Members',
        tooltip: 'Estimate total members in group',
        align: 'left',
        sortable: true,
        getValue: (s) => s.active_members ?? -1,
        render: (s) => (
            <span className="text-[#45556C]" style={{ letterSpacing: '-0.15px' }}>
                {s.active_members ?? '—'}
            </span>
        ),
    },
    {
        key: 'relevant_pct',
        label: 'Relevant %',
        tooltip: 'Estimate how many are relevant to you by gender and age',
        align: 'left',
        sortable: true,
        getValue: (s) => s.relevant_pct ?? -1,
        render: (s) => (
            <span className="text-[#45556C]" style={{ letterSpacing: '-0.15px' }}>
                {s.relevant_pct != null ? `${s.relevant_pct}%` : '—'}
            </span>
        ),
    },
    {
        key: 'source_type',
        label: 'Source Type',
        tooltip: 'Select a type or Other',
        sortable: true,
        getValue: (s) => s.source_type ?? '',
        render: (s) => (
            <span className="text-[#45556C]" style={{ letterSpacing: '-0.15px' }}>
                {s.source_type || '—'}
            </span>
        ),
    },
    {
        key: 'signal',
        label: 'Friend Potential',
        tooltip: 'Indicates the richness of source',
        align: 'center',
        sortable: true,
        getValue: (s) => SIGNAL_SORT_ORDER[s.signal],
        render: (s) => {
            const cfg = SIGNAL_CONFIG[s.signal];
            const pill = SIGNAL_PILL_STYLES[s.signal] ?? SIGNAL_PILL_DEFAULT;

            return (
                <span
                    className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-semibold"
                    style={{
                        backgroundColor: pill.bg,
                        color: pill.text,
                        border: `1px solid ${pill.border}`,
                        lineHeight: '1',
                    }}
                >
                    {cfg?.label ?? s.signal}
                </span>
            );
        },
    }

    //   {
    //     key: 'people',
    //     label: 'People',
    //     align: 'left',
    //     sortable: true,
    //     getValue: (s) => s.associated_people_count,
    //     render: (s) => (
    //       <span className="text-[#45556C]" style={{ letterSpacing: '-0.15px' }}>
    //         {s.associated_people_count}
    //       </span>
    //     ),
    //   },
]

// ── Helpers ──────────────────────────────────────────────────

function InfoTooltip({ text }: { text: string }) {
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
    const ref = useRef<HTMLSpanElement>(null)

    function handleMouseEnter() {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect()
            setPos({ top: rect.bottom + 6, left: rect.left + rect.width / 2 })
        }
    }

    return (
        <span
            ref={ref}
            className="inline-flex items-center ml-0.5"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setPos(null)}
        >
            <span className="w-3.5 h-3.5 rounded-full bg-[#9810FA]/10 text-[#9810FA] text-[9px] font-bold flex items-center justify-center cursor-help leading-none select-none">
                i
            </span>
            {pos !== null && createPortal(
                <span
                    className="fixed z-[9999] px-2.5 py-1.5 bg-[#0F172B] text-white text-xs rounded-lg whitespace-nowrap shadow-lg leading-4 pointer-events-none"
                    style={{ top: pos.top, left: pos.left, transform: 'translateX(-50%)' }}
                >
                    {text}
                </span>,
                document.body
            )}
        </span>
    )
}

function alignClass(align?: 'left' | 'center') {
    if (align === 'center') return 'text-center'
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
        <ChevronUp className="w-3 h-3 text-[#9810FA]" strokeWidth={2} />
    ) : (
        <ChevronDown className="w-3 h-3 text-[#9810FA]" strokeWidth={2} />
    )
}

// ── Main component ──────────────────────────────────────────

interface YourSourcesProps {
    initialSources: SourceWithSignal[]
    allFriends: Friend[]
}

export const YourSources = ({ initialSources, allFriends }: YourSourcesProps) => {
    const [sources, setSources] = useState<SourceWithSignal[]>(initialSources)
    const [sortColumn, setSortColumn] = useState<string>('created_at')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    // Add Source form state
    const [showAddRow, setShowAddRow] = useState(false)
    const [newName, setNewName] = useState('')
    const [newType, setNewType] = useState('')
    const [isAdding, setIsAdding] = useState(false)

    // Edit modal
    const [editSource, setEditSource] = useState<SourceWithSignal | null>(null)

    // Link People modal
    const [linkSource, setLinkSource] = useState<SourceWithSignal | null>(null)

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortColumn(column)
            setSortDirection(column === 'signal' || column === 'created_at' ? 'desc' : 'asc')
        }
    }

    const sortedSources = [...sources].sort((a, b) => {
        if (sortColumn === 'created_at') {
            const aTime = new Date(a.created_at).getTime()
            const bTime = new Date(b.created_at).getTime()
            return sortDirection === 'asc' ? aTime - bTime : bTime - aTime
        }

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

    async function handleAddSource() {
        const trimmed = newName.trim()
        if (!trimmed) {
            toast.error('Please enter a source name.')
            return
        }

        setIsAdding(true)
        try {
            const result = await createSource(trimmed, newType || undefined)
            if (result.error) {
                toast.error(result.error)
                return
            }

            if (result.source) {
                const newSource: SourceWithSignal = {
                    ...result.source,
                    reciprocal_count: 0,
                    associated_people_count: 0,
                    signal: 'low',
                }
                setSources((prev) => [newSource, ...prev])
                setEditSource(newSource)
            }

            setNewName('')
            setNewType('')
            setShowAddRow(false)
            toast.success('Source added!')
        } finally {
            setIsAdding(false)
        }
    }

    function handleSourceSaved(updated: SourceWithSignal) {
        setSources((prev) => [updated, ...prev.filter((s) => s.id !== updated.id)])
    }

    function handleSourceDeleted(sourceId: string) {
        setSources((prev) => prev.filter((s) => s.id !== sourceId))
    }

    const refreshSources = useCallback(async () => {
        const result = await getSourcesWithSignal()
        if (result.sources) {
            setSources(result.sources)
            // Keep open modals in sync with fresh data
            setEditSource((prev) =>
                prev ? result.sources!.find((s) => s.id === prev.id) ?? null : null
            )
            setLinkSource((prev) =>
                prev ? result.sources!.find((s) => s.id === prev.id) ?? null : null
            )
        }
    }, [])

    const handleLinkChanged = useCallback(() => {
        refreshSources()
    }, [refreshSources])

    return (
        <main className="max-w-[1053px] mx-auto px-4 py-6 sm:py-12">
            <div className="flex flex-col items-center gap-6 sm:gap-12">
                <div
                    className="w-full rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 shadow-sm"
                    style={{
                        background: "linear-gradient(180deg, #FAF5FF 0%, #F8FAFC 100%)"
                    }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                            style={{
                                background: "linear-gradient(180deg, #9810FA 0%, #C800DE 100%)"
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 2.5V5.83333" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9.99996 13.3326C11.8409 13.3326 13.3333 11.8403 13.3333 9.99935C13.3333 8.1584 11.8409 6.66602 9.99996 6.66602C8.15901 6.66602 6.66663 8.1584 6.66663 9.99935C6.66663 11.8403 8.15901 13.3326 9.99996 13.3326Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7.5 15.834H12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8.33337 17.5H11.6667" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M14.3333 4.16602L13.75 4.74935" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M5.66663 4.16602L6.24996 4.74935" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2 className="text-[#0F172B] text-xl font-semibold leading-7">
                            How to use this diagnostic tool
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-x-6 gap-y-0">
                        {/* Left Column */}
                        <div className="flex flex-col gap-4">
                            <InstructionStep
                                title="List all your sources"
                                description="Include groups you participate in now or have ever participated in"
                            />
                            <InstructionStep
                                title="Fill in member counts"
                                description="Estimate if you don't know the exact numbers"
                            />
                            <InstructionStep
                                title="Estimate relevant %"
                                description="The percentage of members within your age and gender range"
                            />
                        </div>

                        {/* Right Column */}
                        <div className="flex flex-col gap-4">
                            <InstructionStep
                                title="Count connections made"
                                description="People you've exchanged contact info with and met outside the group"
                            />
                            <InstructionStep
                                title="Review your results"
                                description="Manage breadth and diversity of exposure to quality people"
                            />
                            <div className=" pt-6 border-t border-[#E2E8F0]/50">
                                <p className="text-[#90A1B9] text-xs leading-4 italic">
                                    💡 Tip: Focus on groups with higher "Friend Potential" to maximize your social ROI
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Your Sources Section */}
                <div className="w-full">
                    <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3">
                        <h2 className="text-xl sm:text-2xl text-[#0F172B] font-bold">Your Sources</h2>
                        <button
                            onClick={() => setShowAddRow(true)}
                            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-3xl bg-[#F8F4FF] hover:bg-[#F0E7FF] transition-colors border border-[#E9D5FF] shrink-0"
                        >
                            <Plus className="w-4 h-4 text-[#9810FA]" strokeWidth={1.33} />
                            <span className="text-[#9810FA] text-xs sm:text-sm font-semibold leading-5 tracking-[-0.15px]">
                                Add Source
                            </span>
                        </button>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="sm:hidden flex flex-col gap-3">
                        {sortedSources.map((source) => {
                            const cfg = SIGNAL_CONFIG[source.signal]
                            const pill = SIGNAL_PILL_STYLES[source.signal] ?? SIGNAL_PILL_DEFAULT

                            return (
                                <div
                                    key={source.id}
                                    onClick={() => setEditSource(source)}
                                    className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm cursor-pointer active:bg-[#F8FAFC] transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-semibold text-[#0F172B] text-sm truncate max-w-[180px]">
                                            {source.name}
                                        </span>
                                        <span
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shrink-0"
                                            style={{
                                                backgroundColor: pill.bg,
                                                color: pill.text,
                                                border: `1px solid ${pill.border}`,
                                            }}
                                        >
                                            {cfg?.label ?? source.signal}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs text-[#45556C]">
                                        <div>
                                            <span className="text-[#90A1B9] block">Members</span>
                                            <span className="font-medium">{source.active_members ?? '—'}</span>
                                        </div>
                                        <div>
                                            <span className="text-[#90A1B9] block">Relevant</span>
                                            <span className="font-medium">{source.relevant_pct != null ? `${source.relevant_pct}%` : '—'}</span>
                                        </div>
                                        <div>
                                            <span className="text-[#90A1B9] block">Type</span>
                                            <span className="font-medium">{source.source_type || '—'}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Mobile Add Source Form */}
                        {showAddRow && (
                            <div className="rounded-xl border border-[#E2E8F0] bg-[#FAF5FF]/30 p-4 shadow-sm">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Source name"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddSource()
                                        if (e.key === 'Escape') {
                                            setShowAddRow(false)
                                            setNewName('')
                                            setNewType('')
                                        }
                                    }}
                                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[#9810FA]/20 focus:border-[#9810FA]"
                                />
                                <select
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value)}
                                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm mb-3 text-[#45556C] focus:outline-none focus:ring-2 focus:ring-[#9810FA]/20 focus:border-[#9810FA]"
                                >
                                    <option value="">Select type</option>
                                    {SOURCE_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleAddSource}
                                        disabled={isAdding}
                                        className="flex-1 py-2 rounded-lg bg-[#9810FA] text-white text-sm font-semibold hover:bg-[#7A0DD4] transition-colors disabled:opacity-50"
                                    >
                                        {isAdding ? 'Adding...' : 'Add Source'}
                                    </button>
                                    <button
                                        onClick={() => { setShowAddRow(false); setNewName(''); setNewType('') }}
                                        className="flex-1 py-2 rounded-lg text-[#62748E] text-sm font-semibold border border-[#E2E8F0] hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Mobile Empty State */}
                        {sources.length === 0 && !showAddRow && (
                            <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
                                <p className="text-[#62748E] text-sm mb-2">No sources added yet.</p>
                                <button
                                    onClick={() => setShowAddRow(true)}
                                    className="text-[#9810FA] text-sm font-semibold hover:underline"
                                >
                                    Add your first source
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden sm:block w-full rounded-2xl bg-white overflow-hidden border border-[#E2E8F0] shadow-xl">
                        <div>
                            <table className="w-full border-collapse">
                                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                                    <tr>
                                        {COLUMNS.map((col) => (
                                            <th
                                                key={col.key}
                                                onClick={() => col.sortable && handleSort(col.key)}
                                                className={`px-4 py-3.5 text-sm font-semibold text-[#45556C] whitespace-nowrap ${alignClass(col.align)} ${col.sortable ? 'cursor-pointer hover:bg-[#F1F5F9] transition-colors' : ''}`}
                                                style={{ letterSpacing: '-0.15px' }}
                                            >
                                                <div
                                                    className={`flex items-center gap-1.5 ${col.align === 'center' ? 'justify-center' : ''}`}
                                                >
                                                    <span>{col.label}</span>
                                                    {col.tooltip && <InfoTooltip text={col.tooltip} />}
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
                                    {sortedSources.map((source) => (
                                        <tr
                                            key={source.id}
                                            onClick={() => setEditSource(source)}
                                            className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]/50 transition-colors cursor-pointer"
                                        >
                                            {COLUMNS.map((col) => (
                                                <td
                                                    key={col.key}
                                                    className={`px-4 py-4 text-sm whitespace-nowrap ${alignClass(col.align)}`}
                                                    style={{ letterSpacing: '-0.15px' }}
                                                >
                                                    {col.render(source)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}

                                    {/* Add Source inline row */}
                                    {showAddRow && (
                                        <tr className="border-b border-[#F1F5F9] bg-[#FAF5FF]/30">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    value={newName}
                                                    onChange={(e) => setNewName(e.target.value)}
                                                    placeholder="Source name"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') handleAddSource()
                                                        if (e.key === 'Escape') {
                                                            setShowAddRow(false)
                                                            setNewName('')
                                                            setNewType('')
                                                        }
                                                    }}
                                                    className="w-full bg-transparent text-sm font-medium leading-5 tracking-[-0.15px] placeholder:text-[rgba(10,10,10,0.5)] focus:outline-none"
                                                />
                                            </td>
                                            <td className="px-4 py-3" />
                                            <td className="px-4 py-3" />
                                            <td className="px-4 py-3">
                                                <select
                                                    value={newType}
                                                    onChange={(e) => setNewType(e.target.value)}
                                                    className="w-full bg-transparent text-sm font-medium leading-5 tracking-[-0.15px] text-[#45556C] focus:outline-none cursor-pointer"
                                                >
                                                    <option value="">Select type</option>
                                                    {SOURCE_TYPES.map((t) => (
                                                        <option key={t} value={t}>{t}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={handleAddSource}
                                                        disabled={isAdding}
                                                        className="px-3 py-1 rounded-lg bg-[#9810FA] text-white text-xs font-semibold hover:bg-[#7A0DD4] transition-colors disabled:opacity-50"
                                                    >
                                                        {isAdding ? '...' : 'Add'}
                                                    </button>
                                                    <button
                                                        onClick={() => { setShowAddRow(false); setNewName(''); setNewType('') }}
                                                        className="px-3 py-1 rounded-lg text-[#62748E] text-xs font-semibold hover:bg-gray-100 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {/* Empty state */}
                                    {sources.length === 0 && !showAddRow && (
                                        <tr>
                                            <td colSpan={COLUMNS.length} className="px-4 py-12 text-center">
                                                <p className="text-[#62748E] text-sm mb-2">No sources added yet.</p>
                                                <button
                                                    onClick={() => setShowAddRow(true)}
                                                    className="text-[#9810FA] text-sm font-semibold hover:underline"
                                                >
                                                    Add your first source
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-center gap-3 sm:gap-8 mt-4">
                        <LegendItem color="#22C55E" label="Higher Potential (3+ connections)" />
                        <LegendItem color="#F59E0B" label="Medium Potential (1-2 connections)" />
                        <LegendItem color="#FB7185" label="Lower Potential (0 connections)" />
                    </div>
                </div>
            </div>

            {/* Edit Source Modal */}
            {editSource && (
                <EditSourceModal
                    open={!!editSource}
                    onClose={() => setEditSource(null)}
                    source={editSource}
                    onSaved={handleSourceSaved}
                    onDeleted={() => handleSourceDeleted(editSource.id)}
                    onManagePeople={() => {
                        setLinkSource(editSource)
                    }}
                />
            )}

            {/* Link People Modal */}
            {linkSource && (
                <LinkPeopleModal
                    open={!!linkSource}
                    onClose={() => setLinkSource(null)}
                    sourceId={linkSource.id}
                    sourceName={linkSource.name}
                    allFriends={allFriends}
                    onChanged={handleLinkChanged}
                />
            )}
        </main>
    )
}


export function InstructionStep({ title, description }: { title?: string; description: string }) {
    return (
        <div className="flex items-start gap-3">
            <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#9810FA' }}
            >
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="text-[#0F172B] text-sm font-semibold leading-5 tracking-[-0.15px]">
                    {title}
                </h3>
                <p className="text-[#62748E] text-sm leading-5 tracking-[-0.15px]">
                    {description}
                </p>
            </div>
        </div>
    )
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: color, borderColor: color }}
            />
            <span className="text-[#45556C] text-xs leading-4">
                {label}
            </span>
        </div>
    )
}
