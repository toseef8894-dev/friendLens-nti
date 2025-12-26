'use client'

import { Settings as SettingsIcon } from 'lucide-react'

export default function AdminSettingsPage() {
    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Configure application settings</p>
            </div>

            {/* Placeholder Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <SettingsIcon className="text-gray-400" size={32} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Settings Coming Soon</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    Application settings and configuration options will be available in a future update.
                </p>
            </div>
        </div>
    )
}
