import dynamic from 'next/dynamic'
import HeroSection from './_components/HeroSection'

const StartHereSurvey = dynamic(() => import('./_components/StartHereSurvey'), {
    ssr: false,
})

export default function StartHerePage() {
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
