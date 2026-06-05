const SURVEY_URL =
    'https://docs.google.com/forms/d/1JkLiIZFMoX4U1__gcWc-sdoUIdRiWXve3NGYz1dpxHY/viewform'

export default function ProlificSurveyCTA() {
    return (
        <div className="w-full max-w-[1053px] mx-auto mt-8">
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center space-y-4">
                <p className="text-gray-600 text-sm">
                    Help us improve FriendLens. Please complete a brief feedback survey (approximately 2 minutes).
                </p>
                <a
                    href={SURVEY_URL}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-shadow"
                >
                    Complete Beta Feedback Survey
                </a>
            </div>
        </div>
    )
}
