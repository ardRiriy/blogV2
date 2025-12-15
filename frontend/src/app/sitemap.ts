import { getAllArticle } from '@/lib/api'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 動的なページ一覧を取得
  const posts = await getAllArticle(); 

  // 固定ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${process.env.PUBLISH_URL}/`,
      lastModified: new Date(),
    },
    {
      url: `${process.env.PUBLISH_URL}/list`,
      lastModified: new Date(),
    }
  ]
  
  const dynamicPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${process.env.PUBLISH_URL}/articles/${post.url_suffix}`,
    lastModified: new Date(post.date),
  }))
  
  return [...staticPages, ...dynamicPages]
}
