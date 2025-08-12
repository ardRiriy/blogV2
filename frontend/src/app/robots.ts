import { MetadataRoute } from 'next'
import { env } from 'process'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',    },
    sitemap: `${env.PUBLISH_URL}/sitemap.xml`,
  }
}