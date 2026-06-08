export default function ResultsLoading() {
    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/bgImage.png')" }}
        >
            <div className="flex flex-col items-center pt-6 sm:pt-[40px] px-4 pb-12 sm:pb-20">
                {/* Hero skeleton */}
                <div className="w-full max-w-2xl mb-8 animate-pulse">
                    <div className="h-8 bg-white/60 rounded-xl w-48 mx-auto mb-3" />
                    <div className="h-4 bg-white/40 rounded-lg w-64 mx-auto" />
                </div>

                {/* Content skeleton */}
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-10 gap-6">
                    <div className="lg:col-span-7 space-y-6 animate-pulse">
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center space-y-3">
                            <div className="h-10 bg-gray-100 rounded-xl w-56 mx-auto" />
                            <div className="h-5 bg-gray-100 rounded-lg w-40 mx-auto" />
                            <div className="h-4 bg-gray-50 rounded w-full max-w-lg mx-auto" />
                        </div>
                        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-6 h-36" />
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-48" />
                    </div>
                    <div className="lg:col-span-3 animate-pulse">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-64" />
                    </div>
                </div>
            </div>
        </div>
    )
}
