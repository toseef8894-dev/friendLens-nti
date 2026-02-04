export default function HeroSection() {
  return (
    <div className="flex flex-col items-center mb-12 max-w-3xl">
      <h1
        className="text-4xl sm:text-5xl md:text-[64px] font-semibold leading-tight md:leading-[88px] text-center"
        style={{ letterSpacing: '-2px' }}
      >
        <span className="text-[#0F172B]">Your </span>
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          friendships
        </span>
      </h1>

      <p
        className="text-lg font-normal leading-7 text-center text-[#0F172B] max-w-[640px]"
        style={{ letterSpacing: '1.3px' }}
      >
        A living picture of the people in your life right now
      </p>

      <p
        className="text-base font-normal leading-6 text-center text-[#62748E] max-w-[430px]"
        style={{ letterSpacing: '-0.312px', paddingTop: '8px' }}
      >
        Spot your strongest connections, notice which ones are changing, and focus your energy where it matters most.
      </p>
    </div>
  )
}
