import ContactWidget from "@/components/ContactWidget"

export const metadata = {
    title: "Contact | FriendLens",
    description: "Get in touch with the FriendLens team.",
}

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <ContactWidget />
            </div>
        </div>
    )
}