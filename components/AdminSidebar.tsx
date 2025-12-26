'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Settings, ChevronLeft } from 'lucide-react'

const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-gradient-to-b from-indigo-600 to-indigo-800 min-h-screen flex flex-col">
            {/* Logo / Back */}
            <div className="p-4 border-b border-indigo-500/30">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-indigo-200 hover:text-white transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span className="text-sm">Back to App</span>
                </Link>
                <h2 className="mt-4 text-xl font-bold text-white">Admin Panel</h2>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/admin' && pathname.startsWith(item.href))
                        const Icon = item.icon

                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive
                                            ? 'bg-white/20 text-white'
                                            : 'text-indigo-200 hover:bg-white/10 hover:text-white'}
                  `}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-indigo-500/30">
                <p className="text-xs text-indigo-300">FriendLens Admin v1.0</p>
            </div>
        </aside>
    )
}
