export default function Page2() {
    return (
        <main className="relative min-h-screen">
            {/* Background blobs */}
            <div className="absolute inset-0 bg-white">
                <div className="absolute inset-0 blob-c z-0">
                    <div className="shape-blob eight" />
                    <div className="shape-blob nine" />
                </div>
            </div>

            <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
                <h1 className="text-5xl font-extrabold sm:text-6xl">
                    Coming soon...
                </h1>
            </div>
        </main>
    );
}
