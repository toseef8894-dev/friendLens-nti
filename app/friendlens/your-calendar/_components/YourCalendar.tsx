'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import type { CalendarEvent } from '../types'
import {
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
} from '../actions'

const ROLE_COLORS = {
    hosting: '#9810FA',
    invited: '#17AA46',
} as const

interface Props {
    initialEvents: CalendarEvent[]
}

export default function YourCalendar({ initialEvents }: Props) {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth())
    })
    const [events, setEvents] = useState<CalendarEvent[]>(initialEvents)
    const [showAddEvent, setShowAddEvent] = useState(false)
    const [showMonthPicker, setShowMonthPicker] = useState(false)
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
    const [dayEventsPopup, setDayEventsPopup] = useState<{ day: number; events: CalendarEvent[] } | null>(null)

    // ── Add Event form state ──
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        role: 'invited' as 'hosting' | 'invited',
    })
    const [isSaving, setIsSaving] = useState(false)
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // ── Edit Event form state ──
    const [editFormData, setEditFormData] = useState({
        title: '',
        date: '',
        time: '',
        role: 'invited' as 'hosting' | 'invited',
    })
    const editSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // ── Calendar helpers ──
    const getDaysInMonth = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

    const getFirstDayOfMonth = (date: Date) =>
        new Date(date.getFullYear(), date.getMonth(), 1).getDay()

    const monthName = currentMonth.toLocaleString('default', { month: 'long' })
    const yearName = currentMonth.getFullYear()
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)

    const calendarDays: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) calendarDays.push(null)
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

    const getEventsForDate = (day: number) => {
        const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return events.filter((e) => e.date === dateStr)
    }

    // ── Month navigation ──
    const prevMonth = () =>
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))

    const nextMonth = () =>
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))

    const handleMonthSelect = (month: number) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), month))
        setShowMonthPicker(false)
    }

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const year = parseInt(e.target.value)
        if (!isNaN(year)) {
            setCurrentMonth(new Date(year, currentMonth.getMonth()))
        }
    }

    // ── Autosave: Create Event ──
    const autosaveNewEvent = useCallback(
        (data: typeof formData) => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

            if (!data.title.trim() || !data.date) return

            saveTimeoutRef.current = setTimeout(async () => {
                setIsSaving(true)
                const result = await createCalendarEvent({
                    title: data.title.trim(),
                    role: data.role,
                    date: data.date,
                    time: data.time || null,
                })
                setIsSaving(false)

                if (result.error) {
                    toast.error(result.error)
                } else if (result.event) {
                    setEvents((prev) => [...prev, result.event!])
                    setFormData({ title: '', date: '', time: '', role: 'invited' })
                    setShowAddEvent(false)
                    toast.success('Event saved')
                }
            }, 800)
        },
        []
    )

    const updateFormField = (field: string, value: string) => {
        const updated = { ...formData, [field]: value }
        setFormData(updated)
        autosaveNewEvent(updated)
    }

    // ── Autosave: Edit Event ──
    const autosaveEditEvent = useCallback(
        (eventId: string, data: typeof editFormData) => {
            if (editSaveTimeoutRef.current) clearTimeout(editSaveTimeoutRef.current)

            if (!data.title.trim() || !data.date) return

            editSaveTimeoutRef.current = setTimeout(async () => {
                const result = await updateCalendarEvent(eventId, {
                    title: data.title.trim(),
                    role: data.role,
                    date: data.date,
                    time: data.time || null,
                })

                if (result.error) {
                    toast.error(result.error)
                } else if (result.event) {
                    setEvents((prev) =>
                        prev.map((e) => (e.id === eventId ? result.event! : e))
                    )
                    toast.success('Event updated')
                }
            }, 800)
        },
        []
    )

    const updateEditField = (field: string, value: string) => {
        const updated = { ...editFormData, [field]: value }
        setEditFormData(updated)
        if (editingEvent) {
            autosaveEditEvent(editingEvent.id, updated)
        }
    }

    // ── Open edit modal ──
    const openEditEvent = (event: CalendarEvent) => {
        setEditingEvent(event)
        setEditFormData({
            title: event.title,
            date: event.date,
            time: event.time || '',
            role: event.role,
        })
        setDayEventsPopup(null)
    }

    // ── Delete event ──
    const handleDeleteEvent = async () => {
        if (!editingEvent) return
        const result = await deleteCalendarEvent(editingEvent.id)
        if (result.error) {
            toast.error(result.error)
        } else {
            setEvents((prev) => prev.filter((e) => e.id !== editingEvent.id))
            setEditingEvent(null)
            toast.success('Event deleted')
        }
    }

    // ── Today check ──
    const today = new Date()
    const isToday = (day: number) =>
        today.getFullYear() === currentMonth.getFullYear() &&
        today.getMonth() === currentMonth.getMonth() &&
        today.getDate() === day

    return (
        <>
            <main className="w-full max-w-[1200px] mx-auto px-4 py-12 md:py-8">
                {/* Calendar Card */}
                <div className="relative">
                    <div
                        className="rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm"
                        style={{
                            background: 'linear-gradient(180deg, #FAF5FF 0%, #F8FAFC 100%)',
                        }}
                    >
                        <div className="p-6">
                            {/* Month Navigation */}
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={prevMonth}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg text-[#62748E] hover:text-[#0F172B] hover:bg-white/60 transition-colors text-xl"
                                >
                                    &larr;
                                </button>

                                <div
                                    className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                                    onClick={() => setShowMonthPicker(!showMonthPicker)}
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 2.5H15C15.663 2.5 16.2989 2.76339 16.7678 3.23223C17.2366 3.70107 17.5 4.33696 17.5 5V15C17.5 15.663 17.2366 16.2989 16.7678 16.7678C16.2989 17.2366 15.663 17.5 15 17.5H5C4.33696 17.5 3.70107 17.2366 3.23223 16.7678C2.76339 16.2989 2.5 15.663 2.5 15V5C2.5 4.33696 2.76339 3.70107 3.23223 3.23223C3.70107 2.76339 4.33696 2.5 5 2.5Z" stroke="#0F172B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M5 7.5H15" stroke="#0F172B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span className="font-semibold text-[#0F172B]">
                                        {monthName} {yearName}
                                    </span>
                                </div>

                                <button
                                    onClick={nextMonth}
                                    className="w-9 h-9 flex items-center justify-center rounded-lg text-[#62748E] hover:text-[#0F172B] hover:bg-white/60 transition-colors text-xl"
                                >
                                    &rarr;
                                </button>
                            </div>

                            {/* Month Picker Dropdown */}
                            {showMonthPicker && (
                                <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-20 bg-white border border-[#E2E8F0] rounded-lg shadow-lg p-4 min-w-[300px]">
                                    <div className="mb-4">
                                        <label className="block text-xs font-semibold text-[#0F172B] mb-2">Year</label>
                                        <input
                                            type="number"
                                            value={yearName}
                                            onChange={handleYearChange}
                                            className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#9810FA]"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-xs font-semibold text-[#0F172B] mb-2">Month</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
                                                (month, idx) => (
                                                    <button
                                                        key={month}
                                                        onClick={() => handleMonthSelect(idx)}
                                                        className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                                                            currentMonth.getMonth() === idx
                                                                ? 'bg-[#9810FA] text-white'
                                                                : 'bg-[#F8FAFC] text-[#0F172B] hover:bg-[#E2E8F0]'
                                                        }`}
                                                    >
                                                        {month}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowMonthPicker(false)}
                                        className="w-full px-4 py-2 bg-[#9810FA] text-white font-medium rounded-lg hover:bg-[#7810D0] transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                                {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((day) => (
                                    <div key={day} className="text-center font-semibold text-[#45556C] text-xs sm:text-sm py-2">
                                        {day}
                                    </div>
                                ))}

                                {calendarDays.map((day, idx) => {
                                    const dayEvents = day ? getEventsForDate(day) : []
                                    const visibleEvents = dayEvents.slice(0, 2)
                                    const extraCount = dayEvents.length - 2

                                    return (
                                        <div
                                            key={idx}
                                            className={`aspect-square p-1 sm:p-2 rounded-lg border bg-white transition-colors overflow-hidden ${
                                                day && isToday(day)
                                                    ? 'border-[#9810FA] bg-[#FAF5FF]'
                                                    : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                                            }`}
                                        >
                                            {day ? (
                                                <div className="h-full flex flex-col">
                                                    <div
                                                        className={`text-xs sm:text-sm font-medium mb-0.5 ${
                                                            isToday(day) ? 'text-[#9810FA]' : 'text-[#0F172B]'
                                                        }`}
                                                    >
                                                        {day}
                                                    </div>
                                                    <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                                                        {visibleEvents.map((event) => (
                                                            <button
                                                                key={event.id}
                                                                onClick={() => openEditEvent(event)}
                                                                className="w-[90%] text-left text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.5 rounded text-white font-medium truncate flex-shrink-0 hover:opacity-80 transition-opacity"
                                                                style={{ backgroundColor: ROLE_COLORS[event.role] }}
                                                                title={event.title}
                                                            >
                                                                {event.title}
                                                            </button>
                                                        ))}
                                                        {extraCount > 0 && (
                                                            <button
                                                                onClick={() =>
                                                                    setDayEventsPopup({ day, events: dayEvents })
                                                                }
                                                                className="text-[10px] sm:text-xs text-[#9810FA] font-medium hover:underline text-left"
                                                            >
                                                                +{extraCount} more
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : null}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* FAB */}
                    <button
                        onClick={() => setShowAddEvent(true)}
                        className="fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 z-20"
                        style={{
                            background: 'linear-gradient(90deg, #9810FA 0%, #C800DE 100%)',
                        }}
                    >
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 6V22M6 14H22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </main>

            {/* ── Day Events Popup ── */}
            {dayEventsPopup && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center"
                    onClick={() => setDayEventsPopup(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[#0F172B]">
                                Events on {monthName} {dayEventsPopup.day}
                            </h3>
                            <button
                                onClick={() => setDayEventsPopup(null)}
                                className="text-[#62748E] hover:text-[#0F172B] transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-2">
                            {dayEventsPopup.events.map((event) => (
                                <button
                                    key={event.id}
                                    onClick={() => openEditEvent(event)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition-colors text-left"
                                >
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: ROLE_COLORS[event.role] }}
                                    />
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-[#0F172B] truncate">
                                            {event.title}
                                        </div>
                                        {event.time && (
                                            <div className="text-xs text-[#62748E]">{event.time}</div>
                                        )}
                                    </div>
                                    <span
                                        className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full text-white flex-shrink-0"
                                        style={{ backgroundColor: ROLE_COLORS[event.role] }}
                                    >
                                        {event.role === 'hosting' ? 'Hosting' : 'Invited'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Event Modal ── */}
            {showAddEvent && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center"
                    onClick={() => {
                        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
                        setFormData({ title: '', date: '', time: '', role: 'invited' })
                        setShowAddEvent(false)
                    }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-xl font-semibold text-[#0F172B]">Add an Event</h3>
                                {isSaving && (
                                    <span className="text-xs text-[#62748E]">Saving...</span>
                                )}
                            </div>

                            {/* Title */}
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-[#0F172B] mb-2">
                                    Event title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Event name"
                                    value={formData.title}
                                    onChange={(e) => updateFormField('title', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#9810FA] bg-white text-[#0F172B]"
                                    maxLength={100}
                                />
                            </div>

                            {/* Role Toggle */}
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-[#0F172B] mb-2">Role</label>
                                <div className="flex bg-gray-100 rounded-xl p-1">
                                    {(['hosting', 'invited'] as const).map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => updateFormField('role', role)}
                                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                                formData.role === role
                                                    ? 'bg-white shadow-sm text-[#0F172B]'
                                                    : 'text-[#62748E] hover:text-[#0F172B]'
                                            }`}
                                        >
                                            <span
                                                className="inline-block w-2 h-2 rounded-full mr-2"
                                                style={{ backgroundColor: ROLE_COLORS[role] }}
                                            />
                                            {role === 'hosting' ? 'Hosting' : 'Invited'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date */}
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-[#0F172B] mb-2">
                                    Date <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => updateFormField('date', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#9810FA] bg-white text-[#0F172B]"
                                />
                            </div>

                            {/* Time (optional) */}
                            <div className="mb-2">
                                <label className="block text-xs font-semibold text-[#0F172B] mb-2">
                                    Time <span className="text-[#62748E] font-normal">(optional)</span>
                                </label>
                                <input
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => updateFormField('time', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#9810FA] bg-white text-[#0F172B]"
                                />
                            </div>

                            <p className="text-[10px] text-[#90A1B9] mt-1">
                                Event saves automatically when title and date are filled.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Edit Event Modal ── */}
            {editingEvent && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center"
                    onClick={() => {
                        if (editSaveTimeoutRef.current) clearTimeout(editSaveTimeoutRef.current)
                        setEditingEvent(null)
                    }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-xl font-semibold text-[#0F172B]">Edit Event</h3>
                                <button
                                    onClick={() => {
                                        if (editSaveTimeoutRef.current) clearTimeout(editSaveTimeoutRef.current)
                                        setEditingEvent(null)
                                    }}
                                    className="text-[#62748E] hover:text-[#0F172B] transition-colors"
                                >
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </div>

                            {/* Title */}
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-[#0F172B] mb-2">
                                    Event title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Event name"
                                    value={editFormData.title}
                                    onChange={(e) => updateEditField('title', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#9810FA] bg-white text-[#0F172B]"
                                    maxLength={100}
                                />
                            </div>

                            {/* Role Toggle */}
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-[#0F172B] mb-2">Role</label>
                                <div className="flex bg-gray-100 rounded-xl p-1">
                                    {(['hosting', 'invited'] as const).map((role) => (
                                        <button
                                            key={role}
                                            onClick={() => updateEditField('role', role)}
                                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                                editFormData.role === role
                                                    ? 'bg-white shadow-sm text-[#0F172B]'
                                                    : 'text-[#62748E] hover:text-[#0F172B]'
                                            }`}
                                        >
                                            <span
                                                className="inline-block w-2 h-2 rounded-full mr-2"
                                                style={{ backgroundColor: ROLE_COLORS[role] }}
                                            />
                                            {role === 'hosting' ? 'Hosting' : 'Invited'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date */}
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-[#0F172B] mb-2">
                                    Date <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={editFormData.date}
                                    onChange={(e) => updateEditField('date', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#9810FA] bg-white text-[#0F172B]"
                                />
                            </div>

                            {/* Time (optional) */}
                            <div className="mb-6">
                                <label className="block text-xs font-semibold text-[#0F172B] mb-2">
                                    Time <span className="text-[#62748E] font-normal">(optional)</span>
                                </label>
                                <input
                                    type="time"
                                    value={editFormData.time}
                                    onChange={(e) => updateEditField('time', e.target.value)}
                                    className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#9810FA] bg-white text-[#0F172B]"
                                />
                            </div>

                            {/* Delete */}
                            <button
                                onClick={handleDeleteEvent}
                                className="w-full px-4 py-2.5 border border-red-200 text-red-500 font-medium rounded-xl hover:bg-red-50 transition-colors text-sm"
                            >
                                Delete Event
                            </button>

                            <p className="text-[10px] text-[#90A1B9] mt-3 text-center">
                                Changes save automatically.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
