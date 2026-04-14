import {urlForImage} from '@/sanity/lib/utils'
import Image from 'next/image'

interface ImageBoxProps {
  'image'?: {asset?: any}
  'alt'?: string
  'width'?: number
  'height'?: number
  'size'?: string
  'classesWrapper'?: string
  'data-sanity'?: string
}

export default function ImageBox({
  image,
  alt = 'Cover image',
  width = 3500,
  height = 2000,
  size = '100vw',
  classesWrapper,
  ...props
}: ImageBoxProps) {
  //const imageUrl = image && urlForImage(image)?.height(height).width(width).fit('crop').url()
  const imageUrl = image && urlForImage(image)?.fit('max').url()

  return (
    <div
      className={`relative overflow-hidden rounded-2xl flex justify-center items-center ${classesWrapper}`}
      data-sanity={props['data-sanity']}
    >
      {imageUrl && (
        <Image
          className={classesWrapper?.includes('aspect') ? 'absolute h-full w-full object-contain' : 'max-w-full h-auto max-h-[65vh] object-contain'}
          alt={alt}
          width={width}
          height={height}
          sizes={size}
          src={imageUrl}
        />
      )}
    </div>
  )
}
