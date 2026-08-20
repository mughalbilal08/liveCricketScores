import { Zap, ShieldCheck, BarChart3, Smartphone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full max-w-5xl mx-auto mt-12 mb-8 border-t border-white/10 pt-8 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        <div className="flex items-start gap-4">
          <div className="mt-1 text-green-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">Real-time Updates</h4>
            <p className="text-chalk/60 text-sm">Scores refresh roughly every 45 minutes</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="mt-1 text-green-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">Accurate & Reliable</h4>
            <p className="text-chalk/60 text-sm">Trusted data from official sources</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="mt-1 text-green-400">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">All Formats Covered</h4>
            <p className="text-chalk/60 text-sm">Test, ODI, T20 & all major tournaments</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="mt-1 text-green-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-medium mb-1">Mobile Friendly</h4>
            <p className="text-chalk/60 text-sm">Optimized experience for all devices</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
