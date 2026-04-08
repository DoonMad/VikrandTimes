import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vikrand Times',
    short_name: 'Vikrand Times',
    description: 'The weekly Marathi newspaper covering Marathi news, social issues, and community advocacy.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9f9ff',
    theme_color: '#93000b',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
