"use client";

import Image from "next/image";
import {Header} from "@/components/Header";
import {AspectRatio} from "@/components/ui/aspect-ratio";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import ktp_logo from "@/public/Images/ktp_logo.svg"

{/*Project Data*/
}
const data = [
    {
        id: 1,
        title: "SC Economics",
        text: "The South Carolina Council on Economic Education promotes financial and economic literacy for students and teachers across the state. Our members are collaborating directly with the organization’s executive leadership to design and implement a digital solution that streamlines operations and strengthens the impact of economic education throughout South Carolina.",
        image: "/partners/scecon.png",
    },
    {
        id: 2,
        title: "Ella's Stuff A Stocking",
        text: "Ella’s Stuff a Stocking is a holiday donation drive established in memory of Gabriella Shumate, dedicated to spreading joy by providing gifts and essentials to those in need during the holiday season. Our team is rebuilding their site from the ground up, creating a reliable, user-friendly platform that enhances community engagement and ensures the continued success of their annual giving campaign.",
        image: "/partners/ellas.png",
    },
    {
        id: 3,
        title: "Wheels Harbison Area Transit",
        text: "Wheels Harbison Area Transit is a local nonprofit that provides essential mobility services to low-income seniors and disabled residents in the Harbison area. Our team is developing a professional website and digital presence for Wheels Harbison, enabling them to share their mission, accept online donations, and attract corporate sponsorships to sustain their operations.",
        image: "/partners/wheels.png",
    },
];


// Network company data
const networkCompanies = [
    {src: "/network/google.png", alt: "Google"},
    {src: "/network/microsoft.png", alt: "Microsoft"},
    {src: "/network/deloitte.png", alt: "Deloitte"},
    {src: "/network/jpmorgan.png", alt: "JP Morgan"},
    {src: "/network/meta.png", alt: "Meta"},
    {src: "/network/citadel.png", alt: "Citadel"},
    {src: "/network/capital_one.png", alt: "Capital One"},
    {src: "/network/spotify.png", alt: "Spotify"},
    {src: "/network/bloomberg.png", alt: "Bloomberg"},
    {src: "/network/doordash.png", alt: "Doordash"},
    {src: "/network/hudson_river_trading.png", alt: "Hudson River Trading"},
    {src: "/network/amazon.png", alt: "Amazon"},
    {src: "/network/apple.png", alt: "Apple"},
    {src: "/network/tiktok.png", alt: "Tiktok"},
    {src: "/network/nvidia.png", alt: "Nvidia"},
    {src: "/network/duolingo.png", alt: "Duolingo"},
    {src: "/network/jane_street.png", alt: "Jane Street"},
    {src: "/network/pwc.png", alt: "PWC"},
    {src: "/network/ey.png", alt: "EY"},
    {src: "/network/accenture.png", alt: "Accenture"},
    {src: "/network/linkedin.png", alt: "LinkedIn"},
    {src: "/network/tesla.png", alt: "Tesla"},
    {src: "/network/ibm.png", alt: "IBM"},
    {src: "/network/cisco.png", alt: "Cisco"},
    {src: "/network/asana.png", alt: "Asana"},
    {src: "/network/slack.png", alt: "Slack"},
    {src: "/network/figma.png", alt: "Figma"},
    {src: "/network/bleacher_report.png", alt: "Bleacher Report"},
    {src: "/network/stripe.png", alt: "Stripe"},
    {src: "/network/pnc.png", alt: "PNC"},
    {src: "/network/boeing.png", alt: "Boeing"},
    {src: "/network/salesforce.png", alt: "Salesforce"},
    {src: "/network/mongo_db.png", alt: "MongoDB"},
    {src: "/network/vmware.png", alt: "VMware"},
    {src: "/network/nike.png", alt: "Nike"},
    {src: "/network/uber.png", alt: "Uber"},
    {src: "/network/netskope.png", alt: "Netskope"},
    {src: "/network/att.png", alt: "AT&T"},
    {src: "/network/ford.png", alt: "Ford"},
    {src: "/network/modern_treasury.png", alt: "Modern Treasury"},
    {src: "/network/indeed.png", alt: "Indeed"},
    {src: "/network/bank_of_america.png", alt: "Bank of America"},
    {src: "/network/workday.png", alt: "Workday"},
    {src: "/network/caterpillar.png", alt: "Caterpillar"},
    {src: "/network/p&g.png", alt: "P&G"},
    {src: "/network/viget.png", alt: "Viget"},
    {src: "/network/united.png", alt: "United"},
];

export default function Home() {
    return (
        <div className="font-sans min-h-screen flex flex-col overflow-x-hidden">
            <main className="flex flex-col items-center flex-grow p-8 pb-0">
                <Header/>
                <div
                    className="flex flex-row justify-center xl:justify-between mb-12 md:mb-20 lg:mb-32 px-6 sm:px-8 md:px-12 lg:px-20">
                    <div className="absolute inset-0 blob-c z-0 hidden md:block">
                        <div className="shape-blob ten"></div>
                        <div className="shape-blob eleven"></div>
                    </div>
                </div>

                <div className="flex flex-col flex-none">
                    <div className="absolute inset-0 blob-c z-0 block md:hidden overflow-hidden">
                        <div className="shape-blob twelve"></div>
                        <div className="shape-blob thirteen"></div>
                    </div>
                    <div className="border-4 border-white rounded-xl mt-12 p-6 text-center max-w-3xl mx-auto">
                        <div className="relative w-48 h-48 mx-auto mb-6">
                            <Image src={ktp_logo} alt="logo" width={250} height={250}/>
                        </div>

                        {/*Motto*/}

                        {/*Passion*/}
                        <div className="max-w-3xl w-auto mx-auto bg-white/5 backdrop-blur-sm">
                            <h2 className="relative z-10 text-3xl font-bold text-left mt-10">Our Passion</h2>
                            <p className=" border-2 border-gray-400 rounded-xl mt-4 p-6 text-lg leading-relaxed text-gray-700 text-left">
                                Welcome to Kappa Theta Pi at the University of South Carolina where we are committed to
                                fostering a community of inspired technologists, innovators, and
                                leaders. We host workshops, networking events, and professional
                                development sessions that empower members to grow both personally and
                                professionally.
                            </p>
                        </div>
                    </div>

                    {/*Projects*/}
                    <div className="max-w-3xl w-full mx-auto">
                        <h2 className="text-3xl sm:text-xl md:text-2xl mb-2 font-bold text-left mt-10">
                            Ongoing Projects
                        </h2>
                        <div className="relative z-10">
                            <Carousel className="w-full border-2 border-gray-400 rounded-xl p-6 shadow-md mt-4">
                                <CarouselContent>
                                    {data.map((p) => (
                                        <CarouselItem key={p.id} className="w-full">
                                            <div className="flex flex-col md:flex-row items-start">

                                                <div className="w-full md:w-1/2 p-2">
                                                    <h2 className="text-xl font-semibold mb-2 text-gray-900">
                                                        {p.title}
                                                    </h2>
                                                    <p className="leading-relaxed text-gray-700">
                                                        {p.text}
                                                    </p>
                                                </div>

                                                <div
                                                    className="relative w-full h-64 sm:h-56 md:w-1/2 md:h-auto p-4 flex items-center justify-center">
                                                    <div className="relative w-full h-full overflow-hidden rounded-xl">
                                                        <AspectRatio ratio={5 / 4}>
                                                            <Image src={p.image} alt={"${project} logo"} fill
                                                                   className="object-cover w-full max-w-full"/>
                                                        </AspectRatio>
                                                    </div>
                                                </div>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious aria-label="Previous"/>
                                <CarouselNext classaria-label="Next"/>
                            </Carousel>
                        </div>
                    </div>
                </div>

                {/* Network */}
                <div className="px-6 sm:px-8 md:px-12 lg:px-20">
                    <div
                        className="flex justify-left text-3xl lg:text-4xl font-semibold mt-10 mb-12 font-inter"
                        style={{fontWeight: "680", letterSpacing: "-0.02em"}}
                    >
                        Our Network
                    </div>
                    <div
                        className="flex flex-wrap justify-center items-center pb-10 gap-4 lg:gap-8 mb-8 min-h-[160px] lg:min-h-[180px]">
                        {networkCompanies.map((company, index) => (
                            <Image
                                key={company.alt}
                                src={company.src}
                                alt={company.alt}
                                width={200}
                                height={200}
                                className="max-h-6 lg:max-h-8 w-auto transition-all duration-300 hover:scale-110 drop-shadow-md"
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                    animationFillMode: "forwards",
                                }}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
