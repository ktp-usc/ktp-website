import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { Button } from "@/components/ui/button"

export default function Members(){
    return(
        <div>
            <Header/>
            <div className="w-full flex flex-col items-center">
                <h2 className="text-3xl font-bold text-center mt-12 mb-8">Meet the Executive Board</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 justify-items-center">


                    <div className="flex flex-col items-center">
                        <Image src="/Images/Screenshot Owen.png"
                               alt="KTP President"
                               width={180}
                               height={38}
                               priority
                               className="rounded-md"
                        />

                        <a
                            className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer "
                            href="https://www.linkedin.com/in/owencoulam/"
                            target="_blank"
                            rel="noopener noreferrer"

                        >

                            President: <span>Owen Coulam</span>
                        </a>
                    </div>
                    <div className="flex flex-col items-center">
                        <Image
                            src="/Images/Screenshot Darssan.png"
                            alt="Next.js logo"
                            width={180}
                            height={38}
                            priority
                            className="rounded-md"
                        />

                        <a
                            className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer"
                            href="https://www.linkedin.com/in/ledarssan/"
                            target="_blank"
                            rel="noopener noreferrer"

                        >
                            Vice President: <span>Darssan Eswaramoorthi</span>
                        </a>
                    </div>
                    <div className="flex flex-col items-center">
                        <Image
                            src="/Images/Screenshot Josiah.png"
                            alt="Next.js logo"
                            width={180}
                            height={38}
                            priority
                            className="rounded-md"
                        />
                        <a
                            className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer"
                            href="https://www.linkedin.com/in/josiahawhite/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Executive Secretary: <span>Josiah White</span>
                        </a>
                    </div>
                    <div className="flex flex-col items-center">
                        <Image
                            src="/Images/Screenshot Luke.png"
                            alt="Next.js logo"
                            width={180}
                            height={38}
                            priority
                            className="rounded-md"
                        />
                        <a
                            className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer"
                            href="https://www.linkedin.com/in/lukejannazzo/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Director of Outreach: <span>Luke Jannazzo</span>
                        </a>
                    </div>
                    <div className="flex flex-col items-center">
                        <Image
                            src="/Images/Screenshot Braden.png"
                            alt="Next.js logo"
                            width={180}
                            height={38}
                            priority
                            className="rounded-md"
                        />
                        <a
                            className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer"
                            href="https://www.linkedin.com/in/bguliano/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Director of Technical Development: <span>Braden Guliano</span>
                        </a>
                    </div>
                    <div className="flex flex-col items-center">
                        <Image
                            src="/Images/Screenshot Sara.png"
                            alt="Next.js logo"
                            width={180}
                            height={38}
                            priority
                            className="rounded-md"
                        />
                        <a
                            className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer "
                            href="https://www.linkedin.com/in/sara-muthu/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Director of Finance: <span>Sara Muthuselvam</span>
                        </a>
                    </div>
                    <div className="flex flex-col items-center">
                        <Image
                            src="/Images/Screenshot Katie.png"
                            alt="Next.js logo"
                            width={180}
                            height={38}
                            priority
                            className="rounded-md"
                        />                         <a
                        className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer "
                        href="https://www.linkedin.com/in/katiejones404/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Director of Marketing: <span>Katie Jones</span>
                    </a>
                    </div>
                    <div className="flex flex-col items-center">
                        <Image
                            src="/Images/Screenshot Sai.png"
                            alt="Next.js logo"
                            width={180}
                            height={38}
                            priority
                            className="rounded-md"
                        />
                        <a
                            className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer "
                            href="https://www.linkedin.com/in/sai-kottapali-153695288/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Director of Engagement: <span>Sai Kottapali</span>
                        </a>
                    </div>
                    <div className="flex flex-col items-center">
                        <Image
                            src="/Images/Screenshot Tarun.png"
                            alt="Next.js logo"
                            width={180}
                            height={38}
                            priority
                            className="rounded-md"
                        />
                        <a
                            className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer "
                            href="https://www.linkedin.com/in/tarun-ramkumar/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Director of Professional Development: <span>Tarun Ramkumar</span>
                        </a>
                    </div>
                </div>
            </div>
    <div className="w-screen overflow-hidden mt-4">
        <img src="/Images/Banner Image_2.png" alt="Decorative bottom banner" className="block w-full h-40 object-cover max-w-none"/>
    </div>
            <Footer/>
        </div>
    );
}
