import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-dark text-white p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-gold mb-8">
          NUTESA Got Talent NGT10
        </h1>
      </div>

      <div className="relative flex place-items-center mb-12">
        <p className="text-2xl text-center max-w-2xl">
          Theme: <span className="text-gold font-bold">Talent Stardom</span>
          <br />
          Experience the biggest university talent competition.
        </p>
      </div>

      <div className="flex flex-row gap-6">
        <Link
          href="/register/contestant"
          className="bg-gold text-dark px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform"
        >
          Register as Contestant (₦10,000)
        </Link>
        <Link
          href="/register/audience"
          className="bg-green-700 text-white border border-gold/30 px-8 py-4 rounded-full font-bold hover:bg-green-600 transition-colors"
        >
          Get Audience Tickets (₦1,500)
        </Link>
      </div>

      <div className="mt-12">
        <Link href="/admin" className="text-gray-400 hover:text-gold transition-colors">
          Admin Login
        </Link>
      </div>
    </main>
  );
}
