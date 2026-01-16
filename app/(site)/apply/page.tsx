import Link from 'next/link';

export default function ApplyPage() {
    return (
        <main className="min-h-screen px-6 pt-16">
            <div className="flex flex-col items-center">
                {/* Next Steps */}
                <div className="max-w-3xl w-full bg-white rounded-xl shadow-md p-8">
                    <h1 className="text-3xl font-extrabold mb-4 text-center">
                        How to Apply to Kappa Theta Pi
                    </h1>

                    <p className="text-gray-700 mb-6 text-center">
                        Applying is simple: create an account, complete your application, and attend rush events.
                        Your event attendance will be included as part of your application.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-5 mb-6">
                        <h2 className="font-semibold mb-3">
                            Step 1: Create an Account
                        </h2>

                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>
                                Sign up for an applicant account in our portal.
                            </li>
                            <li>
                                Use your USC email so we can match you to your application.
                            </li>
                            <li>
                                Once your account is created, you’ll be able to access and submit your application.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-5 mb-6">
                        <h2 className="font-semibold mb-3">
                            Step 2: Complete and Submit Your Application
                        </h2>

                        <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            <li>
                                Fill out all required sections carefully and review your answers.
                            </li>
                            <li>
                                Submit your application before the deadline listed on the site.
                            </li>
                            <li>
                                Keep an eye on your email for updates after the submission window closes.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-5 mb-6">
                        <h2 className="font-semibold mb-3">
                            Step 3: Attend Rush Events
                        </h2>

                        <p className="text-gray-700 text-center">
                            Visit the <strong>Rush</strong> page to see the full schedule of events, then make sure you
                            attend the ones you can. Rush event attendance is tracked and will be included on your
                            application.
                        </p>

                        <div className="mt-4 flex justify-center">
                            <Link
                                href="/rush"
                                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                            >
                                View Rush Events
                            </Link>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 text-center">
                        Questions or having trouble with the portal?
                        <br />
                        Contact us at{' '}
                        <a
                            href="mailto:soktp@mailbox.sc.edu"
                            className="text-blue-600 underline"
                        >
                            soktp@mailbox.sc.edu
                        </a>.
                    </p>
                </div>
            </div>
        </main>
    );
}
