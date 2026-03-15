export default function HeroSection() {
    return (
        <div className="flex flex-col items-center mb-10 max-w-3xl px-4">
            <h1
                className="text-3xl sm:text-5xl md:text-[64px] font-semibold leading-tight md:leading-[88px] text-center"
                style={{ letterSpacing: '-2px' }}
            >
                <span className="text-[#0F172B]">Start </span>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Here
                </span>
            </h1>

            <p
                className="text-lg font-normal leading-7 text-center text-[#0F172B] max-w-[640px]"
                style={{ letterSpacing: '1.3px' }}
            >
                A quick check-in to find where to begin
            </p>
        </div>
    )
}
