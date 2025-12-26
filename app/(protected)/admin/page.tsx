'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, UserCheck, FileText, CheckCircle, TrendingUp } from 'lucide-react'

interface Stats {
    totalSignups: number
    completedProfiles: number
    totalSubmissions: number
    totalResults: number
    successRate: number
}

export default function AdminDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/admin/stats')
                const data = await res.json()

                if (!res.ok) {
                    if (res.status === 403) {
                        router.push('/assessment')
                        return
                    }
                    throw new Error(data.error || 'Failed to fetch stats')
                }

                setStats(data.stats)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [router])

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-48"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="text-red-600">{error}</div>
            </div>
        )
    }

    const statCards = [
        {
            title: 'Total Signups',
            value: stats?.totalSignups || 0,
            icon: Users,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700'
        },
        {
            title: 'Completed Profiles',
            value: stats?.completedProfiles || 0,
            icon: UserCheck,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-700'
        },
        {
            title: 'Submissions',
            value: stats?.totalSubmissions || 0,
            icon: FileText,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-700'
        },
        {
            title: 'Success Rate',
            value: `${stats?.successRate || 0}%`,
            icon: TrendingUp,
            color: 'bg-amber-500',
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-700'
        }
    ]

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Overview of FriendLens analytics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card) => {
                    const Icon = card.icon
                    return (
                        <div
                            key={card.title}
                            className={`${card.bgColor} rounded-2xl p-6 border border-gray-100 shadow-sm`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${card.textColor} opacity-80`}>
                                        {card.title}
                                    </p>
                                    <p className={`text-3xl font-bold ${card.textColor} mt-2`}>
                                        {card.value}
                                    </p>
                                </div>
                                <div className={`${card.color} p-3 rounded-xl`}>
                                    <Icon className="text-white" size={24} />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Classification Summary</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600">Total Classified</p>
                        <p className="text-2xl font-bold text-gray-900">{stats?.totalResults || 0}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {(stats?.totalSubmissions || 0) - (stats?.totalResults || 0)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
