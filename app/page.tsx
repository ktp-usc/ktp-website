import Image from "next/image";

export default function Home() {
    return (
    <div className="font-sans min-h-screen p-8 pb-20 flex flex-col items-center">
      <main className="flex flex-col items center w-full">
      <div className="border-4 border-[#19FF19] rounded-xl mt-12 p-6 shadow-sm text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Kappa Theta Pi</h1>
        <p className="text-xl mt-2">
          University of South Carolina, Columbia
        </p>
      </div>
            <div className="border border-transparent rounded-xl max-w-3xl mt-12 p-6 shadow-xl text-center mx-auto bg-white/5 backdrop-blur-sm">
        <h2 className="text-2xl font-semibold text-left mb-4">
          About Our Chapter
        </h2>
        <p className="text-lg leading-relaxed text-gray-700">
          Kappa Theta Pi at the University of South Carolina is committed to
          fostering a community of passionate technologists, innovators, and
          leaders. We host workshops, networking events, and professional
          development sessions that empower members to grow both personally and
          professionally.
        </p>
      </div>
            <div className="border-2 border-gray-400 rounded-xl p-6 text-center shadow-md mt-10">
        <h2 className="text-2xl font-semibold text-left mb-4">
          Our Partners
        </h2>
        <p className="text-lg leading-relaxed text-gray-700">
        Pictures of the companies, project info, organized by 1r, 3c
        </p>
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
            
            President: <p>Owen Coulam</p>
          </a>
        </div>
        <div className="flex flex-col items-center">
                  <Image
          className="dark:invert"
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
            Vice President: <p>Darssan Eswaramoorthi</p>
          </a>
          </div>
        <div className="flex flex-col items-center">
          <Image
          className="dark:invert"
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
            Executive Secretary: <p>Josiah White</p>
          </a>
          </div>
          <div className="flex flex-col items-center">
          <Image
          className="dark:invert"
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
            Director of Outreach:<p>Luke Jannazzo</p>
          </a>
          </div>
          <div className="flex flex-col items-center">
                  <Image
          className="dark:invert"
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
            Director of Technical Development: <p>Braden Guliano</p>
          </a>
          </div>
          <div className="flex flex-col items-center">
                  <Image
          className="dark:invert"
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
            Director of Finance: <p>Sara Muthuselvam</p>
          </a>  
          </div>
          <div className="flex flex-col items-center">
         <Image
          className="dark:invert"
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
            Director of Marketing: <p>Katie Jones</p>
          </a>    
          </div>
          <div className="flex flex-col items-center">
         <Image
          className="dark:invert"
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
            Director of Engagement: <p>Sai Kottapali</p>
          </a>    
          </div>
          <div className="flex flex-col items-center">
          <Image
          className="dark:invert"
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
            Director of Professional Development: <p>Tarun Ramkumar</p>
          </a>
          </div>
          </div>
          </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
