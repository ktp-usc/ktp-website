import Image from 'next/image';
import logo from '../CircleLogo-Transparent.png';
import Link from 'next/link';
                          
export function Header() {
  return (
    <header className="w-full bg-white shadow-md fixed top-0 left-0 rounded-2xl">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <Image src={logo} alt="Logo" width={40} height={40} className="inline-block mr-3" />
        <Link href="/page2" className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 inline-block" >
                Rush Page 
        </Link>
        <Link href="/Home" className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 inline-block">
                Home Page
        </Link>
      </div>
    </header>
  );
}