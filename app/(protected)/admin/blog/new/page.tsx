'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { createPost } from '../actions'
import { slugify } from '@/lib/slugify'

const INPUT_CLASS = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors'

export default function NewBlogPostPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
    const [excerpt, setExcerpt] = useState('')
    const [content, setContent] = useState('')
    const [coverUrl, setCoverUrl] = useState('')

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
                const { error } = await createPost({
                    title,
                    slug: slug || undefined,
                    content,
                    excerpt,
                    cover_image_url: coverUrl || undefined,
                })
                if (error) { toast.error(error); return }
                toast.success('Post created!')
                router.push('/admin/blog')
            })()
        })
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
                    <h1 className="text-2xl font-bold text-gray-900">New Post</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Create a new blog post</p>
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
                        <p className="text-xs text-gray-400 mt-1">Auto-generated from title. Edit to customise.</p>
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
                        {isPending ? 'Saving...' : 'Save Draft'}
                    </button>
                </div>
            </form>
        </div>
    )
}
