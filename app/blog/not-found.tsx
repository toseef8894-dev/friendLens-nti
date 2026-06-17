import Link from 'next/link'

export default function BlogNotFound() {
    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/bgImage.png')" }}
        >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-4">404</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172B] mb-4">Post not found</h1>
                <p className="text-[#62748E] mb-8">
                    This post may have been unpublished or the link is incorrect.
                </p>
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
                >
                    ← Back to Blog
                </Link>
            </div>
        </div>
    )
}
