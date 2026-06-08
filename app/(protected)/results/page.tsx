import { createClient } from '@/lib/supabase/server'
import ResultsView from '@/components/ResultsView'
import { redirect } from 'next/navigation'
import { getUserResult } from '@/lib/auth-utils'
import HeroSection from '@/app/friendlens/your-style/_components/HeroSection'

export default async function ResultsPage({
    searchParams
}: {
    searchParams: Promise<{ from_login?: string }>
}) {
    const supabase = createClient()
    const params = await searchParams

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const fromLogin = params.from_login === 'true'

    const result = await getUserResult(user.id)
    if (!result && !fromLogin) {
        redirect('/assessment')
    }

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/bgImage.png')" }}
        >
            <div className="flex flex-col items-center pt-6 sm:pt-[40px] px-4 pb-12 sm:pb-20">
                <HeroSection />
                <ResultsView
                    initialData={result}
                    userId={user.id}
                    isAnonymous={user.is_anonymous ?? false}
                />
            </div>
        </div>
    )
}
