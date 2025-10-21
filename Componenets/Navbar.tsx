import Image from "next/image";


const Navbar = () => {
    return (
        <nav className="flex items-center justfy-between gap-4 border-b">
            <div className="flex items-center gap-2">
                <Image src="/Images/CircleLogo-Transparent.png"   alt="Logo" width={50} height={50} />
            </div>
        </nav>

    );

};

export default Navbar;

