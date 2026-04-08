import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const baseUrl = 'https://www.vikrandtimes.com';

  // Fetch all editions
  const { data: editions } = await supabase
    .from('editions')
    .select('publish_date')
    .order('publish_date', { ascending: false });

  // Fetch all special editions
  const { data: specialEditions } = await supabase
    .from('special_editions')
    .select('slug, updated_at')
    .order('publish_date', { ascending: false });

  // Map editions to sitemap entries
  const editionEntries: MetadataRoute.Sitemap = (editions || []).map((edition) => ({
    url: `${baseUrl}/edition/${edition.publish_date}`,
    lastModified: new Date(edition.publish_date),
    changeFrequency: 'never',
    priority: 0.8,
  }));

  const specialEditionEntries: MetadataRoute.Sitemap = (specialEditions || []).map((special) => ({
    url: `${baseUrl}/special-edition/${special.slug}`,
    lastModified: new Date(special.updated_at || new Date()),
    changeFrequency: 'never',
    priority: 1.0,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/special-editions`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...specialEditionEntries,
    ...editionEntries,
  ];
}
