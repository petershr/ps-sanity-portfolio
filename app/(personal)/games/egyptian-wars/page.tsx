import Link from 'next/link'

export const metadata = {
  title: 'Egyptian Wars',
  description: 'CS50 Egyptian Wars Card Game',
}

export default function EgyptianWarsGame() {
  return (
    <div className="flex flex-col space-y-8 py-10 w-full max-w-[100rem] mx-auto min-h-screen">
      <div className="flex flex-wrap gap-4 items-center justify-between pb-8 border-b border-gray-200/50">
        <h1 className="text-3xl md:text-5xl font-bold font-sans tracking-tight">Egyptian Wars</h1>
        <Link 
          href="/games/index.html" 
          target="_blank" 
          className="bg-black text-white px-6 py-3 rounded-full font-bold interactive-hover shadow-lg hover:shadow-xl shrink-0"
        >
          Play Full Screen
        </Link>
      </div>
      
      <div className="relative w-full aspect-[4/3] md:aspect-[16/10] max-h-[85vh] overflow-hidden rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-gray-900 bg-[#91c6ff]">
        <iframe 
           src="/games/index.html"
           className="w-full h-full border-none pt-[10px]"
           title="Egyptian Wars Game"
           allowFullScreen
        ></iframe>
      </div>
      
      <div className="prose lg:prose-xl font-geist text-gray-700 max-w-4xl pt-6">
        <p className="text-xl leading-relaxed">
          A classic speed-based card game. The goal is to collect all the cards. Watch out for doubles, sandwiches, and face cards!
          <br /><br />
          Built without any frameworks using purely HTML, CSS, and Vanilla JavaScript—representing a delicate balance of logic and timing mechanics.
        </p>
      </div>
    </div>
  )
}
