import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'
import HeroSection from './_components/HeroSection'
import { getStartHereGateStatus } from './actions'

const StartHereSurvey = dynamic(() => import('./_components/StartHereSurvey'), {
    ssr: false,
})

function firstParam(v: string | string[] | undefined): string | undefined {
    if (v === undefined) return undefined
    return Array.isArray(v) ? v[0] : v
}

export default async function StartHerePage({
    searchParams,
}: {
    searchParams: { after?: string | string[]; add?: string | string[] }
}) {
    const gate = await getStartHereGateStatus()
    const afterInsight = firstParam(searchParams.after) === '1'
    const addAnother = firstParam(searchParams.add) === '1'
    const bypassGate = afterInsight || addAnother

    if (!gate.shouldGate && !bypassGate) {
        redirect('/friendlens/your-people')
    }

    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/bgImage.png')" }}
        >
            <main className="flex flex-col items-center pt-6 sm:pt-[40px] px-4 pb-12 sm:pb-20">
                <HeroSection />

                <section className="w-full max-w-3xl">
                    <StartHereSurvey />
                </section>
            </main>
        </div>
    )
}
