'use client'

import { useState, useCallback } from 'react'
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
    high: { color: '#17AA46', label: 'Higher' },
    medium: { color: '#FFC91B', label: 'Medium' },
    low: { color: '#D53242', label: 'Lower' },
}

const SIGNAL_SORT_ORDER: Record<Signal, number> = { high: 3, medium: 2, low: 1 }

// ── Column definition ────────────────────────────────────────

interface Column {
    key: string
    label: string
    render: (s: SourceWithSignal) => React.ReactNode
    align?: 'left' | 'center'
    sortable?: boolean
    getValue?: (s: SourceWithSignal) => string | number
}

const COLUMNS: Column[] = [
    {
        key: 'name',
        label: 'Source or Potential Source',
        sortable: true,
        getValue: (s) => s.name.toLowerCase(),
        render: (s) => {
            const display = s.name.length > 30 ? s.name.slice(0, 30) + '…' : s.name
            return (
                <span
                    className="font-medium text-[#0F172B] block truncate"
                    style={{ letterSpacing: '-0.15px' }}
                    title={s.name}
                >
                    {display}
                </span>
            )
        },
    },
    {
        key: 'active_members',
        label: 'Active Members',
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
        align: 'center',
        sortable: true,
        getValue: (s) => SIGNAL_SORT_ORDER[s.signal],
        render: (s) => {
            const cfg = SIGNAL_CONFIG[s.signal];
            const stylesBySignal: Record<string, { bg: string; text: string; border: string }> = {
                medium: { bg: '#FFF4D6', text: '#8A5A00', border: '#FFE2A3' },
                lower: { bg: '#FAD6DA', text: '#D61F2C', border: '#F3B2B8' },
                higher: { bg: '#DDF4E3', text: '#118C3A', border: '#BDE9C9' },
            };

            const key = (s.signal || '').toLowerCase();
            const pill = stylesBySignal[key] ?? { bg: '#EEF2FF', text: '#3730A3', border: '#C7D2FE' };

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
    const [sortColumn, setSortColumn] = useState<string>('signal')
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
            setSortDirection(column === 'signal' ? 'desc' : 'asc')
        }
    }

    const sortedSources = [...sources].sort((a, b) => {
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
                setSources((prev) => [...prev, newSource])
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
        setSources((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
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
        <main className="max-w-[1053px] mx-auto px-4 py-12">
            <div className="flex flex-col items-center gap-12">
                <div
                    className="w-full rounded-2xl border border-[#E2E8F0] p-6 shadow-sm"
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
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[#0F172B] text-2xl font-bold">Your Sources</h2>
                        <button
                            onClick={() => setShowAddRow(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-3xl bg-[#F8F4FF] hover:bg-[#F0E7FF] transition-colors border border-[#E9D5FF]"
                        >
                            <Plus className="w-4 h-4 text-[#9810FA]" strokeWidth={1.33} />
                            <span className="text-[#9810FA] text-sm font-semibold leading-5 tracking-[-0.15px]">
                                Add Source
                            </span>
                        </button>
                    </div>

                    {/* Table */}
                    <div className="w-full rounded-2xl bg-white overflow-hidden border border-[#E2E8F0] shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse table-fixed">
                                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                                    <tr>
                                        {COLUMNS.map((col) => (
                                            <th
                                                key={col.key}
                                                onClick={() => col.sortable && handleSort(col.key)}
                                                className={`px-4 py-3.5 text-sm font-semibold text-[#45556C] whitespace-nowrap ${alignClass(col.align)} ${col.sortable ? 'cursor-pointer hover:bg-[#F1F5F9] transition-colors' : ''
                                                    }`}
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
                                            {/* Source Name */}
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
                                            {/* Active Members */}
                                            <td className="px-4 py-3" />
                                            {/* Relevant % */}
                                            <td className="px-4 py-3" />
                                            {/* Source Type */}
                                            <td className="px-4 py-3">
                                                <select
                                                    value={newType}
                                                    onChange={(e) => setNewType(e.target.value)}
                                                    className="w-full bg-transparent text-sm font-medium leading-5 tracking-[-0.15px] text-[#45556C] focus:outline-none cursor-pointer"
                                                >
                                                    <option value="">Select type</option>
                                                    {SOURCE_TYPES.map((t) => (
                                                        <option key={t} value={t}>
                                                            {t}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            {/* Signal (actions) */}
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
                                                        onClick={() => {
                                                            setShowAddRow(false)
                                                            setNewName('')
                                                            setNewType('')
                                                        }}
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
                    <div className="flex flex-wrap items-center justify-center gap-8 mt-4">
                        <LegendItem color="#17AA46" label="Higher Potential (3+ connections)" />
                        <LegendItem color="#FFC91B" label="Medium potential(1-2 connections)" />
                        <LegendItem color="#D53242" label="Lower Potential (0 connections)" />
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

// ── Sub-components ──────────────────────────────────────────

function InstructionStep({ title, description }: { title: string; description: string }) {
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
