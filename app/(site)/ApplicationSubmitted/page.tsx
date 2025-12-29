import Link from "next/link";

export default function ApplicationSubmittedPage() {
    return (
        <main className="min-h-screen px-6 pt-16">
            <div className="flex flex-col items-center">
                {/* Card */}
                <div className="max-w-3xl w-full bg-white rounded-xl shadow-md p-8">
                    <h1 className="text-3xl font-extrabold mb-4 text-center">
                        Application Submitted
                    </h1>

                    <p className="text-gray-700 mb-6 text-center">
                        Thank you for submitting your Kappa Theta Pi rush application!
                        Your application has been successfully received and is now under review.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-5 mb-6">
                        <h2 className="font-semibold mb-3">
                            Next Steps
                        </h2>

                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>
                                An applicant account will be automatically created for you in our portal.
                            </li>
                            <li>
                                You will receive an email containing a temporary,
                                randomly generated password.
                            </li>
                            <li>
                                You can log in using your USC email and temporary password,
                                and you will be prompted to reset your password.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-5 mb-6">
                        <h2 className="font-semibold mb-3">
                            Interviews
                        </h2>

                        <p className="text-gray-700 text-center">
                            Our team will review applications once the submission window closes.
                            Applicants selected for interviews <strong>will be notified via email.</strong>
                        </p>
                    </div>

                    <p className="text-sm text-gray-600 text-center">
                        If you do not receive an email containing a temporary password,
                        please check your spam folder or
                        <br />
                        contact us at{" "}
                        <a
                            href="mailto:soktp@mailbox.sc.edu"
                            className="text-blue-600 underline"
                        >
                            soktp@mailbox.sc.edu
                        </a>.
                    </p>
                </div>

                {/* Back link (outside the card) */}
                <div className="mt-6">
                    <Link
                        href="/"
                        className="text-blue-600 hover:underline font-medium"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
