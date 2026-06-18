'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/rbac'
import { slugify } from '@/lib/slugify'

// ── Types ─────────────────────────────────────────────────────

export interface BlogPost {
    id: string
    title: string
    slug: string
    content: string
    excerpt: string
    cover_image_url: string | null
    is_published: boolean
    published_at: string | null
    author_id: string
    created_at: string
    updated_at: string
}

// Subset returned by getPublishedPosts (listing only — no content/is_published/author_id)
export interface BlogPostSummary {
    id: string
    title: string
    slug: string
    excerpt: string
    cover_image_url: string | null
    published_at: string | null
    created_at: string
}

export interface BlogPostFormData {
    title: string
    slug?: string
    content: string
    excerpt: string
    cover_image_url?: string
    published_at?: string
}

// ── Helpers ───────────────────────────────────────────────────

async function getAuthenticatedUser() {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return { supabase: null, user: null } as const
    return { supabase, user } as const
}

function revalidateBlog() {
    revalidatePath('/admin/blog')
    revalidatePath('/blog', 'layout')
    revalidatePath('/blog/[slug]', 'page')
}

// ── Admin: getAllPostsForAdmin ─────────────────────────────────

export async function getAllPostsForAdmin(): Promise<{ posts?: BlogPost[]; error?: string }> {
    try {
        await requireAdmin()
    } catch {
        return { error: 'Not authorized' }
    }

    const { supabase } = await getAuthenticatedUser()
    if (!supabase) return { error: 'Not authenticated' }

    const { data, error: dbError } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false })

    if (dbError) return { error: dbError.message }
    return { posts: data as BlogPost[] }
}

// ── Admin: getPostById ────────────────────────────────────────

export async function getPostById(id: string): Promise<{ post?: BlogPost; error?: string }> {
    try {
        await requireAdmin()
    } catch {
        return { error: 'Not authorized' }
    }

    const { supabase } = await getAuthenticatedUser()
    if (!supabase) return { error: 'Not authenticated' }

    const { data, error: dbError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()

    if (dbError || !data) return { error: 'Post not found' }
    return { post: data as BlogPost }
}

// ── Public: getPublishedPosts ─────────────────────────────────

const PAGE_SIZE = 9

export async function getPublishedPosts(page = 1): Promise<{
    posts?: BlogPostSummary[]
    totalPages?: number
    currentPage?: number
    error?: string
}> {
    const supabase = createClient()
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error: dbError, count } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image_url, published_at, created_at', { count: 'exact' })
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .range(from, to)

    if (dbError) return { error: dbError.message }
    const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)
    return { posts: data as BlogPostSummary[], totalPages, currentPage: page }
}

// ── Public: getPostBySlug ─────────────────────────────────────

export async function getPostBySlug(slug: string): Promise<{ post?: BlogPost; error?: string }> {
    const supabase = createClient()

    const { data, error: dbError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

    if (dbError || !data) return { error: 'Post not found' }
    return { post: data as BlogPost }
}

// ── Admin: createPost ─────────────────────────────────────────

export async function createPost(formData: BlogPostFormData): Promise<{ post?: BlogPost; error?: string }> {
    try {
        await requireAdmin()
    } catch {
        return { error: 'Not authorized' }
    }

    const { supabase, user } = await getAuthenticatedUser()
    if (!supabase || !user) return { error: 'Not authenticated' }

    const title = formData.title.trim()
    if (!title) return { error: 'Title is required.' }

    const slug = formData.slug?.trim() || slugify(title)
    if (!slug) return { error: 'Could not generate a slug from the title.' }

    const { data, error: dbError } = await supabase
        .from('blog_posts')
        .insert({
            title,
            slug,
            content: formData.content.trim(),
            excerpt: formData.excerpt.trim(),
            cover_image_url: formData.cover_image_url?.trim() || null,
            published_at: formData.published_at ? new Date(formData.published_at).toISOString() : null,
            author_id: user.id,
        })
        .select()
        .single()

    if (dbError) {
        if (dbError.code === '23505') return { error: 'A post with this slug already exists.' }
        return { error: dbError.message }
    }

    revalidateBlog()
    return { post: data as BlogPost }
}

// ── Admin: updatePost ─────────────────────────────────────────

export async function updatePost(id: string, formData: BlogPostFormData): Promise<{ error?: string }> {
    try {
        await requireAdmin()
    } catch {
        return { error: 'Not authorized' }
    }

    const { supabase } = await getAuthenticatedUser()
    if (!supabase) return { error: 'Not authenticated' }

    const title = formData.title.trim()
    if (!title) return { error: 'Title is required.' }

    const slug = formData.slug?.trim() || slugify(title)
    if (!slug) return { error: 'Could not derive a slug.' }

    const { error: dbError } = await supabase
        .from('blog_posts')
        .update({
            title,
            slug,
            content: formData.content.trim(),
            excerpt: formData.excerpt.trim(),
            cover_image_url: formData.cover_image_url?.trim() || null,
            published_at: formData.published_at ? new Date(formData.published_at).toISOString() : null,
        })
        .eq('id', id)

    if (dbError) {
        if (dbError.code === '23505') return { error: 'A post with this slug already exists.' }
        return { error: dbError.message }
    }

    revalidateBlog()
    return {}
}

// ── Admin: deletePost ─────────────────────────────────────────

export async function deletePost(id: string): Promise<{ error?: string }> {
    try {
        await requireAdmin()
    } catch {
        return { error: 'Not authorized' }
    }

    const { supabase } = await getAuthenticatedUser()
    if (!supabase) return { error: 'Not authenticated' }

    const { error: dbError } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id)

    if (dbError) return { error: dbError.message }

    revalidateBlog()
    return {}
}

// ── Admin: publishPost ────────────────────────────────────────

export async function publishPost(id: string): Promise<{ error?: string }> {
    try {
        await requireAdmin()
    } catch {
        return { error: 'Not authorized' }
    }

    const { supabase } = await getAuthenticatedUser()
    if (!supabase) return { error: 'Not authenticated' }

    // Preserve a manually set published_at; only default to now if none is set
    const { data: current } = await supabase
        .from('blog_posts')
        .select('published_at')
        .eq('id', id)
        .single()

    const { error: dbError } = await supabase
        .from('blog_posts')
        .update({ is_published: true, published_at: current?.published_at ?? new Date().toISOString() })
        .eq('id', id)

    if (dbError) return { error: dbError.message }

    revalidateBlog()
    return {}
}

// ── Admin: unpublishPost ──────────────────────────────────────

export async function unpublishPost(id: string): Promise<{ error?: string }> {
    try {
        await requireAdmin()
    } catch {
        return { error: 'Not authorized' }
    }

    const { supabase } = await getAuthenticatedUser()
    if (!supabase) return { error: 'Not authenticated' }

    const { error: dbError } = await supabase
        .from('blog_posts')
        .update({ is_published: false })
        .eq('id', id)

    if (dbError) return { error: dbError.message }

    revalidateBlog()
    return {}
}
