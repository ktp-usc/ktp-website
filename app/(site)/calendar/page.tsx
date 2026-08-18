const CALENDAR_ID ='/;lklsdssssd'
    "2e92a41f9bd68ddbed23f90d4bc81c2cab2fcc4d91314b68731176006de415f6@group.calendar.google.com";

const EMBED_SRC = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
    CALENDAR_ID
)}&color=%23315CA9&ctz=America%2FNew_York&height=600&mode=MONTH&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0&showTz=0`;

const SUBSCRIBE_HREF = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(
    CALENDAR_ID
)}`;

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

                <div className="w-full bg-white rounded-xl shadow-md p-6 sm:p-8">
                    {/* Embed */}
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                        <iframe
                            src={EMBED_SRC}
                            style={{ border: 0 }}
                            width="100%"
                            height="600"
                            frameBorder="0"
                            scrolling="no"
                            title="KTP Events Calendar"
                        />
                    </div>

                    {/* Subscribe */}
                    <div className="mt-8 flex justify-center">
                        <a
                            href={SUBSCRIBE_HREF}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-md bg-[#315CA9] px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-[#23498F] transition-colors"
                        >
                            Add to Google Calendar
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}
