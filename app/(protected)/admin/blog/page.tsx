'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { PenLine, Trash2, Eye, EyeOff, Plus } from 'lucide-react'
import {
    getAllPostsForAdmin,
    deletePost,
    publishPost,
    unpublishPost,
    type BlogPost,
} from './actions'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function AdminBlogPage() {
    const router = useRouter()
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null)
    const [isPending, startTransition] = useTransition()

    useEffect(() => { fetchPosts() }, [])

    async function fetchPosts() {
        setLoading(true)
        const { posts: data, error: err } = await getAllPostsForAdmin()
        if (err) {
            if (err === 'Not authorized') { router.push('/admin'); return }
            setError(err)
        } else {
            setPosts(data || [])
        }
        setLoading(false)
    }

    function handlePublishToggle(post: BlogPost) {
        startTransition(() => {
            void (async () => {
                const fn = post.is_published ? unpublishPost : publishPost
                const { error: err } = await fn(post.id)
                if (err) { toast.error(err); return }
                toast.success(post.is_published ? 'Post unpublished' : 'Post published')
                setPosts(prev =>
                    prev.map(p =>
                        p.id === post.id ? { ...p, is_published: !p.is_published } : p
                    )
                )
            })()
        })
    }

    async function handleDelete() {
        if (!deleteTarget) return
        const { error: err } = await deletePost(deleteTarget.id)
        if (err) { toast.error(err); setDeleteTarget(null); return }
        toast.success('Post deleted')
        setPosts(prev => prev.filter(p => p.id !== deleteTarget.id))
        setDeleteTarget(null)
    }

    return (
        <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your blog content</p>
                </div>
                <Link
                    href="/admin/blog/new"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                >
                    <Plus size={16} />
                    New Post
                </Link>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-100 last:border-0 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                            <div className="h-5 bg-gray-200 rounded-full w-20" />
                            <div className="h-4 bg-gray-200 rounded w-28 ml-auto" />
                        </div>
                    ))}
                </div>
            )}

            {/* Table */}
            {!loading && !error && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {posts.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-gray-500 text-sm mb-4">No posts yet.</p>
                            <Link
                                href="/admin/blog/new"
                                className="text-indigo-600 text-sm font-semibold hover:underline"
                            >
                                Create your first post
                            </Link>
                        </div>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Published</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {posts.map(post => (
                                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900 truncate max-w-[280px]">{post.title}</p>
                                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[280px]">/blog/{post.slug}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                post.is_published
                                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                            }`}>
                                                {post.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <span className="text-sm text-gray-500">
                                                {post.published_at
                                                    ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                                    : '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handlePublishToggle(post)}
                                                    disabled={isPending}
                                                    title={post.is_published ? 'Unpublish' : 'Publish'}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                                                >
                                                    {post.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                                <Link
                                                    href={`/admin/blog/${post.id}/edit`}
                                                    title="Edit"
                                                    className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                >
                                                    <PenLine size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteTarget(post)}
                                                    title="Delete"
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Delete confirm */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Delete Post"
                message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    )
}
