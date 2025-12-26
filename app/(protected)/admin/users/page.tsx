'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/ConfirmDialog'

interface UserData {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
    full_name: string | null
    role: 'admin' | 'user'
    created_at: string
    result: {
        nti_type: string | null
        nti_type_label: string | null
        archetype: string | null
        archetype_tagline: string | null
        assessed_at: string
    } | null
}

export default function AdminUsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [changingRole, setChangingRole] = useState<string | null>(null)
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean
        userId: string
        newRole: 'admin' | 'user'
        userName: string
    }>({
        isOpen: false,
        userId: '',
        newRole: 'user',
        userName: ''
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        try {
            const res = await fetch('/api/admin/users')
            const data = await res.json()

            if (!res.ok) {
                if (res.status === 403) {
                    router.push('/assessment')
                    return
                }
                throw new Error(data.error || 'Failed to fetch users')
            }

            setUsers(data.users)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    function handleRoleChangeClick(userId: string, currentRole: 'admin' | 'user', newRole: 'admin' | 'user') {
        // Prevent changing admin role
        if (currentRole === 'admin') {
            toast.error('Admin role cannot be changed')
            return
        }

        const user = users.find(u => u.id === userId)
        const userName = user 
            ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
            : 'this user'

        setConfirmDialog({
            isOpen: true,
            userId,
            newRole,
            userName
        })
    }

    async function confirmRoleChange() {
        const { userId, newRole } = confirmDialog

        setChangingRole(userId)
        setConfirmDialog({ ...confirmDialog, isOpen: false })

        try {
            const res = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to change role')
            }

            toast.success(`Role updated to ${newRole}`)

            setUsers(users.map(u =>
                u.id === userId ? { ...u, role: newRole } : u
            ))
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setChangingRole(null)
        }
    }

    if (loading) {
        return (
            <div className="p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                    <div className="h-64 bg-gray-200 rounded-xl"></div>
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

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Users</h1>
                <p className="text-gray-600 mt-1">
                    {users.length} registered user{users.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    NTI Type
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Archetype
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Joined
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {user.first_name || user.last_name
                                                    ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                                    : user.full_name || 'No name'}
                                            </div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.result ? (
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {user.result.nti_type || 'Unknown'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.result.nti_type_label}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">Not assessed</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.result ? (
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {user.result.archetype || 'Unknown'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.result.archetype_tagline}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChangeClick(user.id, user.role, e.target.value as 'admin' | 'user')}
                                            disabled={changingRole === user.id || user.role === 'admin'}
                                            className={`
                        px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
                        ${user.role === 'admin'
                                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                    : 'bg-gray-50 text-gray-700 border-gray-200'}
                        ${changingRole === user.id || user.role === 'admin' 
                                                    ? 'opacity-50 cursor-not-allowed' 
                                                    : 'cursor-pointer hover:border-gray-300'}
                      `}
                                            title={user.role === 'admin' ? 'Admin role cannot be changed' : ''}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No users found</p>
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Change User Role"
                message={`Are you sure you want to change ${confirmDialog.userName}'s role to ${confirmDialog.newRole}?`}
                confirmText="Change Role"
                cancelText="Cancel"
                variant="default"
                onConfirm={confirmRoleChange}
                onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            />
        </div>
    )
}
