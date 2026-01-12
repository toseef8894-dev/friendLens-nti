import { createClient } from '@/lib/supabase/server'
import ResultsView from '@/components/ResultsView'
import { redirect } from 'next/navigation'
import { getUserResult } from '@/lib/auth-utils'

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
        <div className="min-h-screen bg-gray-50">
            <ResultsView 
                initialData={result} 
                userId={user?.id} 
                showRedirectMessage={showRedirectMessage}
                fromLogin={fromLogin}
            />
        </div>
    )
}
