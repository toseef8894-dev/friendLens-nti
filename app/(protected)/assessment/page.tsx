import { createClient } from '@/lib/supabase/server'
import AssessmentFlow from '@/components/AssessmentFlow'

export default async function AssessmentPage() {

    return (
        <div className="min-h-screen bg-gray-50">
            <AssessmentFlow />
        </div>
    )
}
