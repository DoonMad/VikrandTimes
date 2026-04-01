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

  // Map editions to sitemap entries
  const editionEntries: MetadataRoute.Sitemap = (editions || []).map((edition) => ({
    url: `${baseUrl}/edition/${edition.publish_date}`,
    lastModified: new Date(edition.publish_date),
    changeFrequency: 'never',
    priority: 0.8,
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
    ...editionEntries,
  ];
}
