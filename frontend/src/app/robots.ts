import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/upload/', '/settings/', '/generate/', '/interview/', '/cover-letter/', '/documents/', '/applications/'],
    },
    sitemap: 'https://hunt-x.app/sitemap.xml',
  }
}
