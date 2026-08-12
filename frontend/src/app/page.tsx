import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-950 text-slate-50">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />
      
      <header className="w-full p-6 flex justify-between items-center z-10 glass sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-bold">M</div>
          <span className="text-xl font-bold tracking-tight">MediMind AI</span>
        </div>
        <nav className="flex gap-4 items-center">
          <Link href="/login" className="text-sm font-medium hover:text-emerald-400 transition-colors">Login</Link>
          <Link href="/register" className="text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-full hover:bg-emerald-500/20 transition-all">Get Started</Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 z-10">
        <div className="max-w-4xl space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-emerald-500/30 text-emerald-300 text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            AI-Powered Medical Intelligence
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Understand your health with <br className="hidden md:block"/>
            <span className="text-gradient">Clarity & Precision</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload your medical reports or describe your symptoms. MediMind AI provides safe, reliable, and evidence-based explanations to help you navigate your health journey.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href="/register" className="px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300">
              Start Free Analysis
            </Link>
            <Link href="#features" className="px-8 py-4 rounded-full glass hover:bg-slate-800/60 font-semibold transition-all duration-300">
              Learn More
            </Link>
          </div>
        </div>
        
        {/* Important Disclaimer */}
        <div className="mt-20 max-w-2xl glass-panel p-6 border-l-4 border-l-amber-500 text-left">
          <h3 className="text-amber-500 font-bold flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Important Medical Disclaimer
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            MediMind AI provides educational information and is <strong>not a substitute for professional medical advice, diagnosis, or treatment</strong>. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. If you think you may have a medical emergency, call your doctor or emergency services immediately.
          </p>
        </div>
      </main>
    </div>
  );
}
