import Image from 'next/image';
import logo from '../CircleLogo-Transparent.png';
                          
export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <Image src={logo} alt="Logo" width={40} height={40} className="inline-block mr-3" />
      </div>
    </header>
  );
}
