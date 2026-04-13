import { HomePage } from '@/components/HomePage'
import { studioUrl } from '@/sanity/lib/api'
import { sanityFetch } from '@/sanity/lib/live'
import { homePageQuery } from '@/sanity/lib/queries'
import Link from 'next/link'

export default async function IndexRoute() {
  const { data } = await sanityFetch({ query: homePageQuery })
  return <HomePage data={data} />
}
