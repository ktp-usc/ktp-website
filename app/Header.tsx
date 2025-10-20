import Image from 'next/image';
import logo from '../CircleLogo-Transparent.png';
                          
export function Header() {
  return (
    <header className="w-full bg-white shadow-md fixed top-0 left-0 rounded-2xl">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <Image src={logo} alt="Logo" width={40} height={40} className="inline-block mr-3" />
      </div>
    </header>
  );
}