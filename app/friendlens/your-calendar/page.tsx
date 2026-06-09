import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HeroSection from './_components/HeroSection'
import YourCalendar from './_components/YourCalendar'
import { getCalendarEvents } from './actions'
import ProlificSurveyCTA from '@/components/ProlificSurveyCTA'
import InfoSection from '@/components/InfoSectionCard'

export default async function YourCalendarPage() {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { events } = await getCalendarEvents()

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/bgImage.png')" }}
        >
            <main className="flex flex-col items-center pt-6 sm:pt-[40px] px-3 sm:px-4 pb-20">
                <HeroSection />
                <main className="w-full max-w-[1200px] mx-auto px-2 sm:px-4 py-6 sm:py-12 md:py-8">
                    <div
                        className="w-full max-w-[1200px] rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 shadow-sm"
                        style={{ background: "linear-gradient(180deg, #FAF5FF 0%, #F8FAFC 100%)" }}
                    >
                        <h2 className="text-[#0F172B] text-base font-semibold leading-6 mb-1">Events</h2>
                        <p className="text-sm text-[#62748E] leading-5" style={{ letterSpacing: '-0.15px' }}>
                            Interaction brings people together and builds bonds. Understanding your activity initiation and invites received helps you create more opportunities for friendship.
                        </p>
                    </div>
                </main>
                <YourCalendar initialEvents={events || []} />
                <InfoSection />
                <ProlificSurveyCTA />
            </main>
        </div>
    )
}
