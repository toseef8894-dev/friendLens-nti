'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import { upsertTimeAllocations } from '../actions'
import type { TimeAllocation } from '../types'

const TIME_CATEGORIES = [
    'Work',
    'Commuting',
    'Shopping, Cooking',
    'Exercise, Self-Maintenance',
    'Socializing w/ Friends',
    'Family Care, Spouse Time',
    'Television',
    'Social Media',
    'Gaming, Gambling',
    'Reading',
    'Sleeping',
] as const


interface TimeRow {
    category: string
    weekday: number
    weekend: number
    notes: string
}

const TOTAL_HOURS = 24

const TIPS = [
    'Try to secure 1 or more days of work from home to decrease commute time',
    'Explore whether you can shift the hours you are in the office to improve commute times',
    'Use shopping services like Instacart to save shopping time',
    'Try delivered pre-prepared meals ready to cook',
    'Order healthy restaurant food and have delivered',
    'Watch recorded TV and streaming to skip advertisements and intros',
    'Try more shorter more intensive workouts to save exercise time',
    'Reduce random social media scrolling, especially non-relational time',
    'Reduce or eliminate gambling time',
    'Limit gaming time to 15 minutes per day',
    'Exercise with a friend, walk, bike, lift',
    'Improve sleep quality with schedule, diet, sun exposure',
    'Develop more social time slots by limiting to 1 hour with a meal and add 30-minute coffee check-ins',
    'If you commute by car, call friends and family more and reduce passive music and podcast consumption',
    "Don't overinvest time in a single friend or partner",
]

function buildInitialRows(initialData?: TimeAllocation[]): TimeRow[] {
    return TIME_CATEGORIES.map((cat) => {
        const saved = initialData?.find((a) => a.category === cat)
        if (saved) {
            return {
                category: cat,
                weekday: saved.weekday,
                weekend: saved.weekend,
                notes: saved.notes || '',
            }
        }
        return {
            category: cat,
            weekday: 0,
            weekend: 0,
            notes: '',
        }
    })
}

interface YourTimeProps {
    initialData?: TimeAllocation[]
}

export default function YourTime({ initialData }: YourTimeProps) {
    const [rows, setRows] = useState<TimeRow[]>(() => buildInitialRows(initialData))
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const totals = useMemo(() => {
        const weekday = rows.reduce((sum, r) => sum + r.weekday, 0)
        const weekend = rows.reduce((sum, r) => sum + r.weekend, 0)
        return { weekday, weekend }
    }, [rows])

    const unallocated = {
        weekday: TOTAL_HOURS - totals.weekday,
        weekend: TOTAL_HOURS - totals.weekend,
    }

    const isOverAllocated = unallocated.weekday < 0 || unallocated.weekend < 0

    const save = useCallback(
        async (currentRows: TimeRow[]) => {
            const totalWd = currentRows.reduce((s, r) => s + r.weekday, 0)
            const totalWe = currentRows.reduce((s, r) => s + r.weekend, 0)
            if (totalWd > 24 || totalWe > 24) return

            setSaveStatus('saving')
            const result = await upsertTimeAllocations(currentRows)
            if (result.error) {
                setSaveStatus('error')
            } else {
                setSaveStatus('saved')
                setTimeout(() => setSaveStatus('idle'), 2000)
            }
        },
        []
    )

    const debouncedSave = useCallback(
        (currentRows: TimeRow[]) => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
            debounceRef.current = setTimeout(() => save(currentRows), 1000)
        },
        [save]
    )


    function updateRow(index: number, field: 'weekday' | 'weekend' | 'notes', value: string) {
        setRows((prev) => {
            const next = prev.map((row, i) => {
                if (i !== index) return row
                if (field === 'notes') {
                    // Max 30 characters, alphanumeric + spaces only
                    const cleaned = value.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 30)
                    return { ...row, notes: cleaned }
                }

                const num = value === '' ? 0 : Number(value)
                if (!Number.isFinite(num) || num < 0) return row
                return { ...row, [field]: num }
            })
            debouncedSave(next)
            return next
        })
    }

    return (
        <main className="max-w-[1053px] mx-auto px-4 py-12">
            <div className="w-full rounded-2xl bg-white overflow-hidden border border-[#E2E8F0] shadow-xl">
                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-[#F8FAFC] border-y border-[#E2E8F0]">
                            <tr>
                                <th
                                    className="px-8 py-3.5 text-left text-sm font-semibold text-[#45556C] whitespace-nowrap"
                                    style={{ letterSpacing: '-0.15px', width: '40%' }}
                                >
                                    <span className="font-bold text-[#0F172B]">Time Allocation</span>
                                    <span className="font-normal text-[#62748E] ml-1">(hours)</span>
                                </th>
                                <th
                                    className="px-4 py-3.5 text-center text-sm font-semibold text-[#45556C] whitespace-nowrap"
                                    style={{ letterSpacing: '-0.15px', width: '18%' }}
                                >
                                    Weekday <span className="font-normal text-[#62748E]">(hrs)</span>
                                </th>
                                <th
                                    className="px-4 py-3.5 text-center text-sm font-semibold text-[#45556C] whitespace-nowrap"
                                    style={{ letterSpacing: '-0.15px', width: '18%' }}
                                >
                                    Weekend <span className="font-normal text-[#62748E]">(hrs)</span>
                                </th>
                                <th
                                    className="px-4 py-3.5 text-left text-sm font-semibold text-[#45556C] whitespace-nowrap"
                                    style={{ letterSpacing: '-0.15px', width: '24%' }}
                                >
                                    Adjustment Notes
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {rows.map((row, index) => (
                                <tr
                                    key={row.category}
                                    className="border-b border-[#F1F5F9] last:border-b-0 hover:bg-[#F8FAFC]/50 transition-colors"
                                >
                                    <td
                                        className="px-8 py-3.5 text-sm font-medium text-[#0F172B]"
                                        style={{ letterSpacing: '-0.15px' }}
                                    >
                                        {row.category}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex justify-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max="24"
                                                step="0.5"
                                                value={row.weekday || ''}
                                                onChange={(e) => updateRow(index, 'weekday', e.target.value)}
                                                placeholder="0"
                                                className="w-16 h-10 text-center rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172B] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-colors"
                                                style={{ letterSpacing: '-0.15px' }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex justify-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max="24"
                                                step="0.5"
                                                value={row.weekend || ''}
                                                onChange={(e) => updateRow(index, 'weekend', e.target.value)}
                                                placeholder="0"
                                                className="w-16 h-10 text-center rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172B] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-colors"
                                                style={{ letterSpacing: '-0.15px' }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            value={row.notes}
                                            onChange={(e) => updateRow(index, 'notes', e.target.value)}
                                            maxLength={30}
                                            placeholder=""
                                            className="w-full h-10 px-3 rounded-lg border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172B] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-colors"
                                            style={{ letterSpacing: '-0.15px' }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Unallocated Time Bar */}
                <div
                    className="flex items-center justify-between px-8 py-3.5"
                    style={{
                        background: 'linear-gradient(90deg, #9810FA 0%, #C800DE 100%)',
                    }}
                >
                    <span className="text-white text-sm font-bold" style={{ letterSpacing: '-0.15px' }}>
                        Unallocated Time
                    </span>
                    <div className="flex items-center gap-3">
                        <span className="text-white text-sm font-medium" style={{ letterSpacing: '-0.15px' }}>
                            Weekday: {unallocated.weekday} hr{unallocated.weekday !== 1 ? 's' : ''}
                            <span className="mx-2 opacity-60">|</span>
                            Weekend: {unallocated.weekend} hr{unallocated.weekend !== 1 ? 's' : ''}
                        </span>
                        {saveStatus === 'saving' && (
                            <span className="text-white/70 text-xs">Saving...</span>
                        )}
                        {saveStatus === 'saved' && (
                            <span className="text-white/70 text-xs">Saved</span>
                        )}
                    </div>
                </div>

                {/* Warning */}
                {isOverAllocated && (
                    <div className="px-8 py-2 bg-[#FFF8F8] border-t border-[#FECDD3]">
                        <p className="text-center text-xs text-red-500 font-medium" style={{ letterSpacing: '-0.15px' }}>
                            * Adjust time to 24 hours or less allocated
                        </p>
                    </div>
                )}
            </div>

            {/* Guidance Text */}
            {/* <div className="mt-8 space-y-1 text-sm text-[#45556C]" style={{ letterSpacing: '-0.15px' }}>
                <p>Recognize where your time is going currently.</p>
                <p>Consider adjustments that can create more unallocated time.</p>
                <p>Most people feel constrained when they see this; small adjustments can help.</p>
            </div> */}

            {/* Tips Section */}
            {/* <div className="mt-8">
                <h3
                    className="text-sm font-bold text-[#0F172B] mb-3"
                    style={{ letterSpacing: '-0.15px' }}
                >
                    How others free up for more time with friends:
                </h3>
                <ul className="space-y-1.5">
                    {TIPS.map((tip) => (
                        <li
                            key={tip}
                            className="text-sm text-[#45556C] italic"
                            style={{ letterSpacing: '-0.15px' }}
                        >
                            {tip}
                        </li>
                    ))}
                </ul>
            </div> */}
        </main>
    )
}
