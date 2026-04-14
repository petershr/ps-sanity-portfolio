import {CustomPortableText} from '@/components/CustomPortableText'
import {Header} from '@/components/Header'
import ImageBox from '@/components/ImageBox'
import {studioUrl} from '@/sanity/lib/api'
import {sanityFetch} from '@/sanity/lib/live'
import {projectBySlugQuery, slugsByTypeQuery} from '@/sanity/lib/queries'
import {urlForOpenGraphImage} from '@/sanity/lib/utils'
import type {Metadata, ResolvingMetadata} from 'next'
import {createDataAttribute, toPlainText} from 'next-sanity'
import {draftMode} from 'next/headers'
import Link from 'next/link'
import {notFound} from 'next/navigation'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateMetadata(
  {params}: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const {data: project} = await sanityFetch({
    query: projectBySlugQuery,
    params,
    stega: false,
  })
  // @ts-ignore the image type sometimes fails
  const ogImage = urlForOpenGraphImage(project?.coverImage)

  return {
    title: project?.title,
    description: project?.overview ? toPlainText(project.overview) : (await parent).description,
    openGraph: ogImage
      ? {
          images: [ogImage, ...((await parent).openGraph?.images || [])],
        }
      : {},
  }
}

export async function generateStaticParams() {
  const {data} = await sanityFetch({
    query: slugsByTypeQuery,
    params: {type: 'project'},
    stega: false,
    perspective: 'published',
  })
  return data
}

export default async function ProjectSlugRoute({params}: Props) {
  const {data} = await sanityFetch({query: projectBySlugQuery, params})

  // Only show the 404 page if we're in production, when in draft mode we might be about to create a project on this slug, and live reload won't work on the 404 route
  if (!data?._id && !(await draftMode()).isEnabled) {
    notFound()
  }

  const dataAttribute =
    data?._id && data._type
      ? createDataAttribute({
          baseUrl: studioUrl,
          id: data._id,
          type: data._type,
        })
      : null

  // Default to an empty object to allow previews on non-existent documents
  const {coverImage, description, duration, overview, title} = data ?? {}

  //const startYear = duration?.start ? new Date(duration.start).getFullYear() : undefined
  //const endYear = duration?.end ? new Date(duration?.end).getFullYear() : 'Now'
  const startPretty = duration?.start ? new Date(duration.start).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }) : undefined
  const endPretty = duration?.end ? new Date(duration.end).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }) : 'Present'
  return (
    <div>
      <div className="mb-20 space-y-6">
        {/* Header */}
        <Header
          id={data?._id || null}
          type={data?._type || null}
          path={['overview']}
          title={title || (data?._id ? 'Untitled' : '404 Project Not Found')}
          description={overview}
        />

        <div className="rounded-md border-0 border-transparent">
          {/* Image  */}
          {data?.title?.toLowerCase().includes('joystick') || data?.title?.toLowerCase().includes('hall effect') ? (
            <img src="/joystick.png" alt="Joystick Main" className="max-w-full h-auto max-h-[85vh] rounded-3xl mr-auto block shadow-sm border border-gray-100 object-contain" />
          ) : (
            <ImageBox
              data-sanity={dataAttribute?.('coverImage')}
              image={coverImage as any}
              // @TODO add alt field in schema
              alt=""
              classesWrapper="relative w-full"
            />
          )}

          <div className="divide-inherit grid grid-cols-1 divide-y lg:grid-cols-1 lg:divide-x lg:divide-y-0">
            {/* Duration */}
            {!!(startPretty && endPretty) && (
              <div className="p-3 lg:p-4 pb-0">
                <div className="text-xs md:text-sm">Duration</div>
                <div className="text-md md:text-lg">
                  <span data-sanity={dataAttribute?.('duration.start')}>{startPretty}</span>
                  {' - '}
                  <span data-sanity={dataAttribute?.('duration.end')}>{endPretty}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="prose lg:prose-xl font-geist text-gray-700 max-w-4xl pt-0 -mt-2 prose-headings:mt-16 prose-headings:mb-6 prose-p:mt-2 prose-p:mb-1">
            <CustomPortableText
              id={data?._id || null}
              type={data?._type || null}
              path={['description']}
              paragraphClasses="relative pl-6 before:content-['•'] before:absolute before:left-0 before:text-gray-400 before:text-[1.2em] before:leading-none my-3 leading-relaxed text-lg md:text-xl lg:text-2xl"
              value={description as any}
            />
          </div>
        )}
        {/* 2-Column Gallery Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 mb-10">
          {data?.gallery?.map((image, index) => (
            <div key={index} className="relative overflow-hidden rounded-3xl shadow-sm border border-gray-100">
              <ImageBox
                image={image}
                alt={image.alt || 'Project gallery image'}
                classesWrapper="relative w-full"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute left-0 w-screen border-t" />
    </div>
  )
}
