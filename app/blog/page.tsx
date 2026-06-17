import Link from 'next/link'
import { getPublishedPosts } from '@/app/(protected)/admin/blog/actions'

export const metadata = {
    title: 'Blog | FriendLens',
    description: 'Articles and insights from the FriendLens team on friendship, social connection, and building better relationships.',
}

interface Props {
    searchParams: { page?: string }
}

export default async function BlogPage({ searchParams }: Props) {
    const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
    const { posts, error, totalPages = 1, currentPage = 1 } = await getPublishedPosts(page)

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/bgImage.png')" }}
        >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

                <div className="mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Blog</h1>
                    <p className="text-gray-500 mt-2 text-base">Insights on friendship, connection, and building a stronger social life.</p>
                </div>

                {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                )}

                {!error && (!posts || posts.length === 0) && (
                    <p className="text-gray-500 text-sm">No posts published yet. Check back soon.</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts?.map(post => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="group block rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden hover:shadow-md transition-shadow bg-white"
                        >
                            {post.cover_image_url && (
                                <div className="aspect-video overflow-hidden bg-gray-100">
                                    <img
                                        src={post.cover_image_url}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            )}
                            <div className="p-5">
                                {post.published_at && (
                                    <p className="text-xs text-[#62748E] mb-2">
                                        {new Date(post.published_at).toLocaleDateString('en-US', {
                                            year: 'numeric', month: 'long', day: 'numeric',
                                        })}
                                    </p>
                                )}
                                <h2 className="text-base font-semibold text-[#0F172B] mb-2 group-hover:text-indigo-600 transition-colors leading-snug">
                                    {post.title}
                                </h2>
                                {post.excerpt && (
                                    <p className="text-sm text-[#62748E] line-clamp-3 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#E2E8F0]">
                        {currentPage > 1 ? (
                            <Link
                                href={`/blog?page=${currentPage - 1}`}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172B] hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                ← Previous
                            </Link>
                        ) : (
                            <span />
                        )}

                        <span className="text-sm text-[#62748E]">
                            Page {currentPage} of {totalPages}
                        </span>

                        {currentPage < totalPages ? (
                            <Link
                                href={`/blog?page=${currentPage + 1}`}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#0F172B] hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                Next →
                            </Link>
                        ) : (
                            <span />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
