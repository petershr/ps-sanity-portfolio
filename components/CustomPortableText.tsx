import ImageBox from '@/components/ImageBox'
import {TimelineSection} from '@/components/TimelineSection'
import type {PathSegment} from '@sanity/client/csm'
import {PortableText, type PortableTextBlock, type PortableTextComponents} from 'next-sanity'
import type {Image} from 'sanity'

export function CustomPortableText({
  id,
  type,
  path,
  paragraphClasses,
  value,
}: {
  id: string | null
  type: string | null
  path: PathSegment[]
  paragraphClasses?: string
  value: PortableTextBlock[]
}) {
  const components: PortableTextComponents = {
    block: {
      normal: ({children, value}) => {
        // Detect "fake" headers that are just bold normal text
        const textContent = (value as any)?.children?.map((c: any) => c.text).join('')?.trim() || '';
        const isBoldHeading = (value as any)?.children?.some((c: any) => c.marks?.includes('strong')) && textContent.length < 40;
        
        if (isBoldHeading && !textContent.startsWith('•')) {
          return <p className="font-extrabold text-2xl mt-10 mb-4 text-black tracking-tight">{children}</p>
        }
        
        return <p className={paragraphClasses}>{children}</p>
      },
      h1: ({children}) => <h1 className="text-4xl font-extrabold mt-12 mb-6 text-black">{children}</h1>,
      h2: ({children}) => <h2 className="text-3xl font-extrabold mt-12 mb-6 text-black">{children}</h2>,
      h3: ({children}) => <h3 className="text-2xl font-extrabold mt-10 mb-4 text-black">{children}</h3>,
      h4: ({children}) => <h4 className="text-xl font-bold mt-8 mb-4 text-black">{children}</h4>,
    },
    marks: {
      link: ({children, value}) => {
        return (
          <a
            className="underline transition hover:opacity-50"
            href={value?.href}
            rel="noreferrer noopener"
          >
            {children}
          </a>
        )
      },
    },
    types: {
      image: ({value}: {value: Image & {alt?: string; caption?: string}}) => {
        return (
          <div className="my-6 space-y-2">
            <ImageBox image={value} alt={value.alt} classesWrapper="relative aspect-[16/9]" />
            {value?.caption && (
              <div className="font-sans text-sm text-gray-600">{value.caption}</div>
            )}
          </div>
        )
      },
      timeline: ({value}) => {
        const {items, _key} = value || {}
        return (
          <TimelineSection
            key={_key}
            id={id}
            type={type}
            path={[...path, {_key}, 'items']}
            timelines={items}
          />
        )
      },
    },
  }

  return <PortableText components={components} value={value} />
}
