import Link from 'next/link'

export const metadata = {
  title: 'Egyptian Wars',
  description: 'CS50 Egyptian Wars Card Game',
}

export default function EgyptianWarsGame() {
  return (
    <div className="mb-20 space-y-6 max-w-[100rem] mx-auto w-full">
      <div className="flex flex-wrap gap-4 items-center justify-between pt-8 mb-8">
        <div className="text-3xl font-extrabold tracking-tight md:text-5xl font-sans text-black">Egyptian Wars</div>
        <Link 
          href="/games/index.html" 
          target="_blank" 
          className="bg-black text-white px-6 py-3 rounded-full font-bold interactive-hover shadow-lg hover:shadow-xl shrink-0"
        >
          Play Full Screen
        </Link>
      </div>
      
      <div className="relative w-full aspect-[4/3] md:aspect-[16/10] max-h-[85vh] overflow-hidden rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-gray-900 bg-white">
        <iframe 
           src="/games/index.html"
           className="w-full h-full border-none"
           title="Egyptian Wars Game"
           allowFullScreen
        ></iframe>
      </div>
      
      <div className="prose lg:prose-xl font-geist text-gray-700 max-w-4xl pt-6">
        <p>Egyptian Wars (also known as Egyptian Rat Screw) has always been my favorite card game. After searching the internet for a digital version without success, I decided to build it myself from scratch using HTML, CSS, and JavaScript.</p>

        <p>The game is a 1v1 battle against an AI bot where players race to collect all 52 cards. The core mechanics revolve around identifying specific patterns—Doubles, Sandwiches, Marriages, Divorces, and Top & Bottoms—to slap the pot and win the pile. I also implemented the complex "Challenge" system, where face cards (Jack, Queen, King, Ace) force the opponent to play a specific number of cards to stay in the game.</p>

        <h3>Technical Implementation</h3>
        <p>The game's engine is built on a custom JavaScript state machine. I used boolean gatekeeping (canPlayerPlay, canBotSlap, etc.) to ensure turn integrity and prevent illegal moves. The most significant technical hurdle was managing the intersection of bot latency and real-time user input. To make the game feel fair, I engineered a system using setTimeouts that allows the bot to "react" at varying difficulties. If a player slaps before the bot's timer clears, the bot's action is instantaneously cancelled to prevent race conditions.</p>

        <h3>Design & UX</h3>
        <p>For the interface, I used Bootstrap and CSS Grid to create a 3x3 layout that keeps the action centered. I used template literals to pull dynamic card assets from the Deck of Cards API. To optimize for high-speed gameplay, I mapped the "Play" action to the 'J' key and "Slap" to the 'SPACE' bar—a layout chosen specifically for ergonomic comfort and reaction speed.</p>

        <p>To improve visibility, I styled the "pot" so the top three cards are always slightly fanned out, allowing players to visually recognize patterns without the UI feeling cluttered. The result is a fast-paced, responsive browser game that finally brings my favorite card game to the digital space.</p>
      </div>
    </div>
  )
}
