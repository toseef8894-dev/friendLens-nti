export default function InfoSection() {
    return (
        <div
            className="w-full max-w-[1053px] rounded-2xl border border-[#E2E8F0] p-4 sm:p-6 shadow-sm mt-6"
            style={{ background: "linear-gradient(180deg, #FAF5FF 0%, #F8FAFC 100%)" }}
        >
            <h2 className="text-[#0F172B] text-base font-semibold leading-6 mb-1">
                Next Section
            </h2>
            <p className="text-sm text-[#62748E] leading-5" style={{ letterSpacing: '-0.15px' }}>
                Your insights will improve as you complete all four sections: People, Sources, Time, and Events. Complete them in any order.
            </p>
        </div>
    )
}
