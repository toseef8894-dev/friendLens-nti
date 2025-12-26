import { createClient } from '@/lib/supabase/server'
import AssessmentFlow from '@/components/AssessmentFlow'
import { redirect } from 'next/navigation'

export default async function AssessmentPage() {
    const supabase = createClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AssessmentFlow />
        </div>
    )
}
