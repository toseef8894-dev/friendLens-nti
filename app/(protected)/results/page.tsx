import { createClient } from '@/lib/supabase/server'
import ResultsView from '@/components/ResultsView'
import { redirect } from 'next/navigation'
import { getUserResult } from '@/lib/auth-utils'

export default async function ResultsPage() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Fetch results server-side
    const result = await getUserResult(user.id)

    // If no results, redirect to assessment page
    if (!result) {
        redirect('/assessment')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ResultsView initialData={result} userId={user.id} />
        </div>
    )
}
