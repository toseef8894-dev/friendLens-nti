export default function HeroSection() {
    return (
        <div className="flex flex-col items-center max-w-3xl">
            <h1
                className="text-4xl sm:text-5xl md:text-[64px] font-semibold leading-tight md:leading-[88px] text-center"
                style={{ letterSpacing: '-2px' }}
            >
                <span className="text-[#0F172B]">Find your </span>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    best sources
                </span>
            </h1>

            <p
                className="text-2xl font-medium leading-7 text-center text-[#45556C] max-w-[640px]"
                style={{ letterSpacing: '1.3px' }}
            >
                of connections and future friends
            </p>

            <p
                className="text-sm font-normal leading-6 text-center text-[#62748E]"
                style={{ letterSpacing: '-0.312px', paddingTop: '16px' }}
            >
                Use this tool to manage breadth and diversity of exposure to new and quality people
            </p>
        </div>
    )
}
