import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/config'
import { getAllPublishedSlugs } from '@/app/(protected)/admin/blog/actions'

// Belt-and-braces fallback in case an admin edit ever bypasses revalidateBlog()'s
// on-demand revalidatePath('/sitemap.xml') call.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1.0 },
        { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.6 },
        { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
        { url: `${SITE_URL}/privacy-policy`, changeFrequency: 'yearly', priority: 0.3 },
        { url: `${SITE_URL}/friendlens/start-here`, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${SITE_URL}/friendlens/your-people`, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${SITE_URL}/friendlens/your-sources`, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${SITE_URL}/friendlens/your-time`, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${SITE_URL}/friendlens/your-calendar`, changeFrequency: 'monthly', priority: 0.8 },
    ]

    const { posts = [] } = await getAllPublishedSlugs()

    const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.updated_at,
        changeFrequency: 'monthly',
        priority: 0.85,
    }))

    return [...staticPages, ...blogPages]
}
