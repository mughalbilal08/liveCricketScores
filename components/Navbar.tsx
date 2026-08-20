import Link from "next/link";
import { Clock, CalendarDays, CheckCircle2, Newspaper, Star } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full py-4 px-6 md:px-12 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Simple red cricket ball representation */}
        <div className="w-6 h-6 rounded-full bg-leather relative overflow-hidden shadow-sm">
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/40 -translate-y-1/2 flex justify-around">
             <div className="w-[1px] h-full bg-white/60"></div>
             <div className="w-[1px] h-full bg-white/60"></div>
             <div className="w-[1px] h-full bg-white/60"></div>
          </div>
        </div>
        <Link href="/" className="text-chalk font-display font-bold text-lg tracking-wide hover:text-white transition-colors">
          Live Cricket Scores
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <Link href="#" className="flex items-center gap-2 text-chalk/80 hover:text-white transition-colors text-sm font-medium">
          <Clock className="w-4 h-4" />
          Live
        </Link>
        <Link href="#" className="flex items-center gap-2 text-chalk/80 hover:text-white transition-colors text-sm font-medium">
          <CalendarDays className="w-4 h-4" />
          Fixtures
        </Link>
        <Link href="#" className="flex items-center gap-2 text-chalk/80 hover:text-white transition-colors text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          Results
        </Link>
        <Link href="#" className="flex items-center gap-2 text-chalk/80 hover:text-white transition-colors text-sm font-medium">
          <Newspaper className="w-4 h-4" />
          News
        </Link>
        <Link href="#" className="flex items-center gap-2 text-chalk/80 hover:text-white transition-colors text-sm font-medium px-4 py-1.5 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/5">
          <Star className="w-4 h-4" />
          Favorites
        </Link>
      </div>
    </nav>
  );
}
