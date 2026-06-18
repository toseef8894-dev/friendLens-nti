'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { getPostById, updatePost } from '../../actions'
import { slugify } from '@/lib/slugify'

function toDatetimeLocal(iso: string): string {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const INPUT_CLASS = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors'

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
    const [excerpt, setExcerpt] = useState('')
    const [content, setContent] = useState('')
    const [coverUrl, setCoverUrl] = useState('')
    const [publishedAt, setPublishedAt] = useState('')

    useEffect(() => {
        async function loadPost() {
            const { post, error } = await getPostById(params.id)
            if (error || !post) { setNotFound(true); setLoading(false); return }
            setTitle(post.title)
            setSlug(post.slug)
            setExcerpt(post.excerpt)
            setContent(post.content)
            setCoverUrl(post.cover_image_url || '')
            setPublishedAt(post.published_at ? toDatetimeLocal(post.published_at) : '')
            setSlugManuallyEdited(true)
            setLoading(false)
        }
        loadPost()
    }, [params.id])

    function handleTitleChange(val: string) {
        setTitle(val)
        if (!slugManuallyEdited) {
            setSlug(slugify(val))
        }
    }

    function handleSlugChange(val: string) {
        setSlugManuallyEdited(true)
        setSlug(val)
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        startTransition(() => {
            void (async () => {
                const { error } = await updatePost(params.id, {
                    title,
                    slug: slug || undefined,
                    content,
                    excerpt,
                    cover_image_url: coverUrl || undefined,
                    published_at: publishedAt || undefined,
                })
                if (error) { toast.error(error); return }
                toast.success('Post updated!')
                router.push('/admin/blog')
            })()
        })
    }

    if (loading) {
        return (
            <div className="p-6 sm:p-8 max-w-3xl space-y-6 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48" />
                <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="h-64 bg-gray-100 rounded-xl" />
                </div>
            </div>
        )
    }

    if (notFound) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">Post not found.</p>
                <Link href="/admin/blog" className="text-indigo-600 text-sm font-semibold hover:underline">Back to Blog</Link>
            </div>
        )
    }

    return (
        <div className="p-6 sm:p-8 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <Link
                    href="/admin/blog"
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Update your blog post</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => handleTitleChange(e.target.value)}
                            placeholder="My awesome post"
                            required
                            className={INPUT_CLASS}
                        />
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={e => handleSlugChange(e.target.value)}
                            placeholder="my-awesome-post"
                            className={INPUT_CLASS}
                        />
                        <p className="text-xs text-gray-400 mt-1">Changing the slug will break existing links to this post.</p>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Excerpt</label>
                        <textarea
                            value={excerpt}
                            onChange={e => setExcerpt(e.target.value)}
                            placeholder="A short summary shown on the blog listing..."
                            rows={3}
                            className={INPUT_CLASS}
                        />
                    </div>

                    {/* Cover Image URL */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover Image URL <span className="text-gray-400 font-normal">(optional)</span></label>
                        <input
                            type="url"
                            value={coverUrl}
                            onChange={e => setCoverUrl(e.target.value)}
                            placeholder="https://..."
                            className={INPUT_CLASS}
                        />
                    </div>

                    {/* Publish Date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Publish Date <span className="text-gray-400 font-normal">(optional)</span></label>
                        <input
                            type="datetime-local"
                            value={publishedAt}
                            onChange={e => setPublishedAt(e.target.value)}
                            className={INPUT_CLASS}
                        />
                        <p className="text-xs text-gray-400 mt-1">Controls sort order. Defaults to publish time if left blank.</p>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content</label>
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Write your post content here..."
                        className={`${INPUT_CLASS} min-h-[360px] resize-y font-mono text-sm`}
                    />
                    <p className="text-xs text-gray-400 mt-1">Supports Markdown formatting.</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 justify-end">
                    <Link
                        href="/admin/blog"
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isPending || !title.trim()}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}
