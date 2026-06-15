import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 font-sans selection:bg-yellow-400 selection:text-black">
      <div className="max-w-md w-full border-4 border-black bg-white p-8 shadow-[8px_8px_0_0_#000] text-center space-y-6">
        <div className="flex justify-center">
          <Image
            src="/images/waiting.svg"
            alt="Waiting"
            width={200}
            height={200}
            className="w-48 h-48 object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform duration-300"
            priority
          />
        </div>

        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter italic text-black">
            404
          </h1>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-black mt-2">
            Page Not Found
          </h2>
        </div>

        <p className="text-black font-medium border-2 border-black p-4 bg-yellow-100">
          Oops! The salita (word) or page you are looking for doesn't exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-4 w-full bg-yellow-400 border-4 border-black text-black font-bold uppercase tracking-tighter text-lg hover:translate-x-[4px] hover:translate-y-[4px] shadow-[4px_4px_0_0_#000] hover:shadow-none transition-all"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
