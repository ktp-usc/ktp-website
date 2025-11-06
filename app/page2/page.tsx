import Footer from "../Footer";
import { Header } from "../Header";
import Link from "next/link";
import CalendarIcon from "../../Componenets/CalendarIcon";
import PinIcon from "../../Componenets/PinIcon";


export default function Page2() {
  return (
    <main>
    <Header />
    <div className= "border-2 border-gray-400 rounded-xl p-6 text-center shadow-md mt-10 max-w-3xl mx-auto bg-white/5 backdrop-blur-sm">
        <h1 className="text-2xl p-4 pb-5">Why rush</h1>
        <div>
            <form>
                {/* Form fields for page 2 go here */}
            </form>
        </div>
    </div>
        <div className="flex justify-center mt-6 mb-10">
            <Link href="/Application" className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 inline-block">
                Rush application
            </Link>
        </div>
             <div className="mb-10 flex items-center relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 -translate-x-1/2">
                <div className="w-4 h-4 rounded-full bg-[#315CA9] z-10"></div>
              </div>
              </div>
              <div className="ml-8 pl-4">
                <h2 className="text-lg sm:text-xl font-bold mb-3">
                  Application Office Hours
                </h2>
                </div>
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <CalendarIcon />
                    <span className="ml-1 font-semibold text-black text-[13px] sm:text-base">
                      Thursday, September 4, 8:00-9:00 PM
                    </span>
                  </div>
                  </div>
                  <div className="flex items-center">
                    <PinIcon />
                    <span className="ml-1 font-semibold text-black text-[13px] sm:text-base">
                      Virtual (Zoom)
                    </span>
                    </div>
                <br></br>
                <div className="mb-10 flex items-center relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 -translate-x-1/2">
                <div className="w-4 h-4 rounded-full bg-[#315CA9] z-10"></div>
              </div>
              </div>
              <div className="ml-8 pl-4">
                <h2 className="text-lg sm:text-xl font-bold mb-3">
                  Application Office Hours
                </h2>
                </div>
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <CalendarIcon />
                    <span className="ml-1 font-semibold text-black text-[13px] sm:text-base">
                      Thursday, September 4, 8:00-9:00 PM
                    </span>
                  </div>
                  </div>
                  <div className="flex items-center">
                    <PinIcon />
                    <span className="ml-1 font-semibold text-black text-[13px] sm:text-base">
                      Virtual (Zoom)
                    </span>
                    
                  </div>
                
        <Footer />
    </main>
  )
}