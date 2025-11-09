import Image from "next/image";
import { Header } from "./Header";
import Footer from "./Footer";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,} from "@/components/ui/carousel"

const data = [
    { id: 1, title: "SC Economics", text: "The South Carolina Council on Economic Education promotes financial and economic literacy for students and teachers across the state. Our members are collaborating directly with the organization’s executive leadership to design and implement a digital solution that streamlines operations and strengthens the impact of economic education throughout South Carolina.",
        image: "/partners/scecon.png"},
    { id: 2, title: "Ella's Stuff A Stocking", text: "Ella’s Stuff a Stocking is a holiday donation drive established in memory of Gabriella Shumate, dedicated to spreading joy by providing gifts and essentials to those in need during the holiday season. Our team is rebuilding their site from the ground up, creating a reliable, user-friendly platform that enhances community engagement and ensures the continued success of their annual giving campaign.",
        image: "/partners/ellas.png"},
    { id: 3, title: "Wheels Harbison Area Transit", text: "Wheels Harbison Area Transit is a local nonprofit that provides essential mobility services to low-income seniors and disabled residents in the Harbison area. Our team is developing a professional website and digital presence for Wheels Harbison, enabling them to share their mission, accept online donations, and attract corporate sponsorships to sustain their operations.",
        image: "/partners/wheels.png"},
];

export default function Home() {
    return (
      <div className="font-sans min-h-screen flex flex-col">
        <main className="flex flex-col items-center flex-grow p-8 pb-0">
          <Header />
          <div className='flex flex-row justify-center xl:justify-between mb-12 md:mb-20 lg:mb-32 px-6 sm:px-8 md:px-12 lg:px-20'>
            <div className="absolute inset-0 blob-c z-0 hidden md:block">
                <div className="shape-blob ten"></div>
                <div className="shape-blob eleven"></div>
        </div>
        <div className='flex-1 flex flex-col items-end'>
          <img src="/images/home/melgrace.jpg" className='hidden xl:block' style={{ width: '175px', transform: 'rotate(10deg)', borderRadius: '25px', marginRight: '50px' }} />
          <img src="/images/home/rock.JPEG" className='hidden xl:block' style={{ width: '200px', transform: 'rotate(-19deg)', borderRadius: '25px', marginRight: '20px' }} />
        </div>

        <div className='flex flex-col flex-none'>
          <div className="absolute inset-0 blob-c z-0 block md:hidden overflow-hidden">
              <div className="shape-blob twelve"></div>
              <div className="shape-blob thirteen"></div>
          </div>
          <div className="border-4 border-white rounded-xl mt-12 p-6 shadow-sm text-center max-w-3xl mx-auto">
            <div className="relative w-48 h-48 mx-auto mb-6">
              <img src="/Images/ktp_logo.svg" alt="logo" width={250} height={250}/>
            </div>
            <div className="border-2 border-gray-400 rounded-xl p-6 text-center shadow-md mt-10 max-w-3xl mx-auto bg-white/5 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold text-left mb-4">Our Passion</h2>
              <p className="text-lg leading-relaxed text-gray-700 text-left">
                Welcome to Kappa Theta Pi at the University of South Carolina where we are committed to
                fostering a community of inspired technologists, innovators, and
                leaders. We host workshops, networking events, and professional
                development sessions that empower members to grow both personally and
                professionally.
              </p>
            </div>
          </div>
            <div className="max-w-3xl w-full mx-auto">
                <h2 className="relative z-10 text-3xl font-bold text-left mt-10">
                    Ongoing Projects
                </h2>
                <div className="relative z-10">
                    <Carousel className="w-full border-2 border-gray-400 rounded-xl p-6 shadow-md mt-4">
                        <CarouselContent>
                            {data.map((p)=>(
                                <CarouselItem key={p.id} className="w-full">
                                    <div className="flex flex-col md:flex-row items-start">

                                        <div className="w-full md:w-1/2 p-2" >
                                            <h2 className="text-xl font-semibold mb-2 text-gray-900">
                                                {p.title}
                                            </h2>
                                            <p className="leading-relaxed text-gray-700">
                                                {p.text}
                                            </p>
                                        </div>

                                        <div className="relative w-full md:w-1/2 h-64 md:h-auto p-4 flex items-center justify-center">
                                            <div className="relative w-full h-full overflow-hidden rounded-xl">
                                                <AspectRatio ratio={5 / 4}>
                                                    <Image src={p.image} alt={"${project} logo"} fill className="object-cover"/>;
                                                </AspectRatio>
                                            </div>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious aria-label="Previous" />
                        <CarouselNext aria-label="Next"/>
                    </Carousel>
                </div>
            </div>

          <div className="w-full flex flex-col items-center">
            <h2 className="text-3xl font-bold text-center mt-12 mb-8">Meet the Executive Board</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 justify-items-center">


          <div className="flex flex-col items-center">
          <Image src="/Images/Screenshot Owen.png"  
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
                    <a
            className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer hover:bg-[#19FF19]"
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
        />

                              <a
            className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer hover:bg-[#19FF19]"
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
        />
                              <a
            className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer hover:bg-[#19FF19]"
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
        />
                              <a
            className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer hover:bg-[#19FF19]"
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
        />
                              <a
            className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer hover:bg-[#19FF19]"
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
        />
           <a
            className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer hover:bg-[#19FF19]"
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
        />                         <a
            className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer hover:bg-[#19FF19]"
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
        />                         
         <a
            className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer hover:bg-[#19FF19]"
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
        />                          
        <a
            className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer hover:bg-[#19FF19]"
            href="https://www.linkedin.com/in/tarun-ramkumar/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Director of Professional Development: <span>Tarun Ramkumar</span>
          </a>
          </div>
          </div>
          </div>
          </div>
          </div>
      <div className="w-screen overflow-hidden mt-0">
        <img src="/Images/Banner Image_2.png" alt="Decorative bottom banner" className="block w-full h-40 object-cover max-w-none"/>
      </div>

  </main>
      <Footer />
    </div>
  );
}
