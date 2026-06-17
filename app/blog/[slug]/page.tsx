import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { getPostBySlug as _getPostBySlug } from '@/app/(protected)/admin/blog/actions'

// Deduplicate DB call between generateMetadata and the page component
const getPostBySlug = cache(_getPostBySlug)

interface Props {
    params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { post } = await getPostBySlug(params.slug)
    if (!post) return { title: 'Post Not Found | FriendLens' }
    return {
        title: `${post.title} | FriendLens`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: post.cover_image_url ? [{ url: post.cover_image_url }] : [],
        },
    }
}

export default async function BlogPostPage({ params }: Props) {
    const { post, error } = await getPostBySlug(params.slug)

    if (!post || error) {
        notFound()
    }

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/bgImage.png')" }}
        >
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

                {/* Cover image */}
                {post.cover_image_url && (
                    <div className="rounded-2xl overflow-hidden mb-10 aspect-video bg-gray-100">
                        <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Meta */}
                {post.published_at && (
                    <p className="text-sm text-[#62748E] mb-3">
                        {new Date(post.published_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'long', day: 'numeric',
                        })}
                    </p>
                )}

                <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172B] mb-4 leading-tight">
                    {post.title}
                </h1>

                {post.excerpt && (
                    <p className="text-lg text-[#62748E] mb-8 leading-relaxed">
                        {post.excerpt}
                    </p>
                )}

                <hr className="border-[#E2E8F0] mb-8" />

                {/* Markdown content */}
                <div className="prose prose-gray max-w-none">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>

                {/* Back link */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <Link
                        href="/blog"
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                    >
                        ← Back to Blog
                    </Link>
                </div>
            </div>
        </div>
    )
}
