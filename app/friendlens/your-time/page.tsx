import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HeroSection from './_components/HeroSection'
import YourTime from './_components/YourTime'
import { getTimeAllocations } from './actions'

export default async function YourTimePage() {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { allocations } = await getTimeAllocations()

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/bgImage.png')" }}
        >
            <main className="flex flex-col items-center pt-[40px] px-4 pb-20">
                <HeroSection />
                <YourTime initialData={allocations} />
            </main>
        </div>
    )
}
