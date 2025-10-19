import Link from "next/link";
import Image from "next/image";
// BEST PRACTICE import CircleLogo-Transparent from "@mui/icons-material/CircleLogo-Transparent";


const Navbar = () => {
    return (
        <nav className="flex items-center justfy-between gap-4 border-b">
            <div className="flex items-center gap-2">
                <Image src="/Images/CircleLogo-Transparent.png"   alt="Logo" width={50} height={50} />
                {/*BEST PRACTICE!!!<Image src={CircleLogo-Transparent} alt="Logo"/>*/}
                {/*<Image src="https:alallalalalalalalallallalalallal" width={30} height={30}/>*/}
            </div>
            {/* <div className="flex gap-4 justify-center">
                <button className="mt-4 rounded bg-[#143d76] px-4 py-2 text-white cursor-pointer hover:bg-[#19FF19]"><Link
                    href="/">Home</Link>
                </button>
                <button className="mt-4 rounded bg-[#002d6a] px-4 py-2 text-white cursor-pointer hover:bg-[#19FF19]"><Link
                    href="/About">About Us</Link>
                </button>
                <button className="mt-4 rounded bg-[#315CA9] px-4 py-2 text-white cursor-pointer hover:bg-[#19FF19]"><Link
                    href="/Apply">Apply Now</Link>
                </button>
                <button className="mt-4 rounded bg-[#458FFF] px-4 py-2 text-white cursor-pointer hover:bg-[#19FF19]"><Link
                    href="/Contact">Contact Us</Link>
                </button>
            </div> */}
        </nav>

    );

};

export default Navbar;

