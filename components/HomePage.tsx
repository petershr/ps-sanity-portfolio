import {Header} from '@/components/Header'
import {OptimisticSortOrder} from '@/components/OptimisticSortOrder'
import {ProjectListItem} from '@/components/ProjectListItem'
import type {HomePageQueryResult} from '@/sanity.types'
import {studioUrl} from '@/sanity/lib/api'
import {resolveHref} from '@/sanity/lib/utils'
import {createDataAttribute} from 'next-sanity'
import Link from 'next/link'

export interface HomePageProps {
  data: HomePageQueryResult | null
}

export async function HomePage({data}: HomePageProps) {
  // Default to an empty object to allow previews on non-existent documents
  const {overview = [], showcaseProjects = [], title = ''} = data ?? {}

  const dataAttribute =
    data?._id && data?._type
      ? createDataAttribute({
          baseUrl: studioUrl,
          id: data._id,
          type: data._type,
        })
      : null

  return (
    <div className="space-y-20">
      {/* Header */}
      {title && (
        <Header
          id={data?._id || null}
          type={data?._type || null}
          path={['overview']}
          centered
          title={title}
          description={overview}
        />
      )}
      {/* Showcase projects */}
      <div className="mx-auto max-w-[100rem] rounded-md border bg-white/50 backdrop-blur-sm shadow-sm">
        <OptimisticSortOrder id={data?._id} path={'showcaseProjects'}>
          {showcaseProjects &&
            showcaseProjects.length > 0 &&
            showcaseProjects.map((project) => {
              // Hide Joystick project from normal flow
              if (project.title?.toLowerCase().includes('joystick') || project.title?.toLowerCase().includes('hall effect')) return null;
              
              const href = resolveHref(project?._type, project?.slug)
              if (!href) {
                return null
              }
              return (
                <Link
                  className="flex flex-col gap-x-5 p-2 transition odd:border-b odd:border-t hover:bg-white/40 xl:flex-row odd:xl:flex-row-reverse"
                  key={project._key}
                  href={href}
                  data-sanity={dataAttribute?.(['showcaseProjects', {_key: project._key}])}
                >
                  <ProjectListItem project={project as any} />
                </Link>
              )
            })}
        </OptimisticSortOrder>

        {/* Custom Row for Joystick and Egyptian Wars */}
        <div className="flex flex-col xl:flex-row border-t divide-y xl:divide-y-0 xl:divide-x divide-gray-200/50">
          
          {/* Joystick Project */}
          {showcaseProjects?.find(p => p.title?.toLowerCase().includes('joystick') || p.title?.toLowerCase().includes('hall effect')) && (
             <Link 
               className="flex flex-col xl:flex-row p-4 transition hover:bg-white/40 xl:w-1/2 w-full gap-x-6 items-center" 
               href={resolveHref('project', showcaseProjects.find(p => p.title?.toLowerCase().includes('joystick') || p.title?.toLowerCase().includes('hall effect'))?.slug)!}
             >
                 <div className="flex w-full xl:w-1/2 items-center">
                    <div className="relative flex w-full flex-col justify-between">
                      <div>
                        <div className="mb-2 text-2xl font-bold font-sans tracking-tight md:text-3xl text-black">
                          {showcaseProjects.find(p => p.title?.toLowerCase().includes('joystick') || p.title?.toLowerCase().includes('hall effect'))?.title}
                        </div>
                        <div className="font-geist text-gray-600 text-lg md:text-xl">
                           <p>An innovative hardware project demonstrating complex PCB engineering.</p>
                        </div>
                      </div>
                    </div>
                 </div>
                 <div className="w-full xl:w-1/2 flex items-center justify-center p-2">
                    <img src="/joystick.png" className="w-full h-auto aspect-square object-cover rounded-xl shadow-sm border border-gray-100 bg-white" alt="Joystick" />
                 </div>
             </Link>
          )}

          {/* Egyptian Wars Project */}
          <Link className="flex flex-col xl:flex-row p-4 transition hover:bg-white/40 xl:w-1/2 w-full gap-x-6 items-center" href="/games/egyptian-wars">
                 <div className="w-full xl:w-1/2 flex items-center justify-center p-2">
                    <img src="https://deckofcardsapi.com/static/img/back.png" className="w-full h-auto max-h-[300px] object-contain rounded-xl" alt="Egyptian Wars Thumbnail" />
                 </div>
                 <div className="flex w-full xl:w-1/2 items-center">
                    <div className="relative flex w-full flex-col justify-between">
                      <div>
                        <div className="mb-2 text-2xl font-bold font-sans tracking-tight md:text-3xl text-black">Egyptian Wars</div>
                        <div className="font-geist text-gray-600 text-lg md:text-xl">
                          <p>I implemented this game with HTML, CSS, and JavaScript. You can check out the rules page, set the difficulty, and play 1-on-1 against the bot with the goal of winning all the cards.</p>
                        </div>
                      </div>
                    </div>
                 </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
