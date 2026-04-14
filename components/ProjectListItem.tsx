import {CustomPortableText} from '@/components/CustomPortableText'
import ImageBox from '@/components/ImageBox'
import type {ShowcaseProject} from '@/types'
import type {PortableTextBlock} from 'next-sanity'

interface ProjectProps {
  project: ShowcaseProject
}

export function ProjectListItem(props: ProjectProps) {
  const {project} = props

  return (
    <>
      <div className="w-full xl:w-9/12 flex items-center justify-center">
        <ImageBox
          image={project.coverImage}
          alt={`Cover image from ${project.title}`}
          classesWrapper="relative w-full"
        />
      </div>
      <div className="flex xl:w-1/4">
        <TextBox project={project} />
      </div>
    </>
  )
}

function TextBox({project}: {project: ShowcaseProject}) {
  return (
    <div className="relative mt-2 flex w-full flex-col justify-between p-3 xl:mt-0">
      <div>
        {/* Title */}
        <div className="mb-2 text-2xl font-bold font-sans tracking-tight md:text-3xl">
          {project.title}
        </div>
        {/* Overview  */}
        <div className="font-geist text-gray-600 text-lg md:text-xl">
          <CustomPortableText
            id={project._id}
            type={project._type}
            path={['overview']}
            value={project.overview as PortableTextBlock[]}
          />
        </div>
      </div>
      {/* Tags */}
      {/* 
      <div className="text-sm font-medium lowercase md:text-lg">
        {project.duration?.start}
      </div>
      */}
      <div className="mt-4 flex flex-row gap-x-2">
        {project.tags?.map((tag, key) => (
          <div className="text-sm font-medium lowercase md:text-lg" key={key}>
            #{tag}
          </div>
        ))}
      </div>
    </div>
  )
}
