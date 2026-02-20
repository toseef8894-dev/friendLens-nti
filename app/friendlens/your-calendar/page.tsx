import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HeroSection from './_components/HeroSection'
import YourCalendar from './_components/YourCalendar'
import { getCalendarEvents } from './actions'

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
            <main className="flex flex-col items-center pt-[40px] px-4 pb-20">
                <HeroSection />
                <YourCalendar initialEvents={events || []} />
            </main>
        </div>
    )
}
