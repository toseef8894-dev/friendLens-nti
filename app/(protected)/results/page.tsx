import { createClient } from '@/lib/supabase/server'
import ResultsView from '@/components/ResultsView'
import { redirect } from 'next/navigation'
import { getUserResult } from '@/lib/auth-utils'
import HeroSection from '@/app/friendlens/your-style/_components/HeroSection'

export default async function ResultsPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ redirected?: string, anonymous?: string, from_login?: string, my_results?: string }> 
}) {
    const supabase = createClient()
    const params = await searchParams

    const { data: { user } } = await supabase.auth.getUser()
    
    const isAnonymous = params.anonymous === 'true'
    const fromLogin = params.from_login === 'true'
    const showRedirectMessage = params.my_results === 'true'

    if (!user && !isAnonymous) {
        redirect('/login')
    }

    let result = null
    if (user) {
        result = await getUserResult(user.id)
        if (!result && !isAnonymous && !fromLogin) {
            redirect('/assessment')
        }
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
                    userId={user?.id}
                    showRedirectMessage={showRedirectMessage}
                    fromLogin={fromLogin}
                />
            </div>
        </div>
    )
}
