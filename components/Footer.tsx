import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="w-full border-t border-black/5 bg-white/80 backdrop-blur-sm mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-gray-400 order-2 sm:order-1">
                    &copy; {new Date().getFullYear()} FriendLens.ai. All rights reserved.
                </p>
                <nav className="flex items-center gap-6 order-1 sm:order-2">
                    <Link
                        href="/about"
                        className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        About Us
                    </Link>
                    <Link
                        href="/contact"
                        className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        Contact Us
                    </Link>
                    <Link
                        href="/privacy-policy"
                        className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        Privacy Policy
                    </Link>
                </nav>
            </div>
        </footer>
    )
}