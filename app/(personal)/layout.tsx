import '@/styles/index.css'
import { CustomPortableText } from '@/components/CustomPortableText'
import { Navbar } from '@/components/Navbar'
import { sanityFetch, SanityLive } from '@/sanity/lib/live'
import { homePageQuery, settingsQuery } from '@/sanity/lib/queries'
import { urlForOpenGraphImage } from '@/sanity/lib/utils'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import { toPlainText, type PortableTextBlock } from 'next-sanity'
import { VisualEditing } from 'next-sanity/visual-editing'
import { draftMode } from 'next/headers'
import { Suspense } from 'react'
import { Toaster } from 'sonner'
import { handleError } from './client-functions'
import { DraftModeToast } from './DraftModeToast'

export async function generateMetadata(): Promise<Metadata> {
  const [{ data: settings }, { data: homePage }] = await Promise.all([
    sanityFetch({ query: settingsQuery, stega: false }),
    sanityFetch({ query: homePageQuery, stega: false }),
  ])

  // @ts-ignore the image type sometimes fails
  const ogImage = urlForOpenGraphImage(settings?.ogImage)
  return {
    title: homePage?.title
      ? {
        template: `%s | ${homePage.title}`,
        default: homePage.title || 'Personal website',
      }
      : undefined,
    description: homePage?.overview ? toPlainText(homePage.overview) : undefined,
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#000',
}

export default async function IndexRoute({ children }: { children: React.ReactNode }) {
  const { data } = await sanityFetch({ query: settingsQuery })
  return (
    <>
      <div className="flex min-h-screen flex-col text-black animated-gradient-bg">
        <Navbar data={data} />
        <div className="mt-20 flex-grow px-4 md:px-16 lg:px-32 pb-24">{children}</div>
        <footer className="bottom-0 w-full bg-white/30 backdrop-blur-md py-12 flex items-center justify-center gap-x-8 md:gap-x-12">
          <a href="https://drive.google.com/file/d/1mXN311_FVeiH_UW5PC_II0cUNLirjQIf/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black font-semibold text-lg md:text-xl interactive-hover">Resume</a>
          <a href="https://www.linkedin.com/in/peter-shr/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-[#0b66c2] font-semibold text-lg md:text-xl interactive-hover">LinkedIn</a>
          <a href="https://github.com/petershr" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black font-semibold text-lg md:text-xl interactive-hover">GitHub</a>
        </footer>
      </div>
      <Toaster />
      <SanityLive onError={handleError} />
      {(await draftMode()).isEnabled && (
        <>
          <DraftModeToast
            action={async () => {
              'use server'

              await Promise.allSettled([
                (await draftMode()).disable(),
                // Simulate a delay to show the loading state
                new Promise((resolve) => setTimeout(resolve, 1000)),
              ])
            }}
          />
          <VisualEditing />
        </>
      )}
      <SpeedInsights />
    </>
  )
}
