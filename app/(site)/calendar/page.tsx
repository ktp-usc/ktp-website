import GoogleCalendarEmbed from "@/components/GoogleCalendarEmbed";

export default function CalendarPage() {
    return (
        <main className="min-h-screen px-6 py-12">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1
                        className="text-3xl sm:text-4xl md:text-5xl font-black mb-0 text-black"
                        style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" }}
                    >
                        Fall 2026 Calendar
                    </h1>

                    <p className="text-base sm:text-lg mt-6 mb-0 font-medium text-gray-600 max-w-2xl mx-auto">
                        Keep up with Chapter Events, Meetings, Opportunities, etc.
                    </p>
                </div>

                <GoogleCalendarEmbed />
            </div>
        </main>
    );
}
