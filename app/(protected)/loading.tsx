export default function ProtectedLoading() {
    return (
        <div
            className="min-h-screen w-full bg-cover bg-center bg-fixed flex items-center justify-center"
            style={{ backgroundImage: "url('/bgImage.png')" }}
        >
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
                <p className="mt-4 text-gray-600 text-sm">Loading…</p>
            </div>
        </div>
    )
}
