import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HeroSection from './_components/HeroSection'
import YourTime from './_components/YourTime'
import { getTimeAllocations } from './actions'
import ProlificSurveyCTA from '@/components/ProlificSurveyCTA'
import InfoSection from '@/components/InfoSectionCard'

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
                <div
                    className="w-full max-w-[1053px] rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 shadow-sm mb-6"
                    style={{ background: "linear-gradient(180deg, #FAF5FF 0%, #F8FAFC 100%)" }}
                >
                    <h2 className="text-[#0F172B] text-base font-semibold leading-6 mb-1">Time</h2>
                    <p className="text-sm text-[#62748E] leading-5" style={{ letterSpacing: '-0.15px' }}>
                        Time affects which friendships get nurtured and which fade. Understanding your time helps you make better friendship investments.
                    </p>
                </div>
                <YourTime initialData={allocations} />
                <InfoSection />
                <ProlificSurveyCTA />
            </main>
        </div>
    )
}
