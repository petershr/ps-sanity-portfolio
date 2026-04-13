import Image from 'next/image'

export const metadata = {
  title: 'About Peter',
  description: 'Learn more about Peter.',
}

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 space-y-10">
      <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-2xl interactive-hover ring-4 ring-offset-4 ring-blue-100">
        <Image
          src="/peter_portrait.png"
          alt="Peter Portrait"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Hi, I'm Peter.
        </h1>

        <p className="text-xl md:text-2xl font-serif text-gray-700 leading-relaxed">
          I am a passionate creator focused on building dynamic and interactive experiences.
          When I'm not coding, I enjoy exploring new technologies and designing sleek user interfaces.
        </p>

        <div className="pt-8">
          <button className="bg-black text-white px-8 py-4 rounded-full font-bold shadow-lg interactive-hover hover:shadow-xl">
            Get in Touch
          </button>
        </div>
      </div>
    </div>
  )
}
