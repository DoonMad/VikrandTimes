import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const baseUrl = 'https://www.vikrandtimes.com';

  const { data: editions } = await supabase
    .from('editions')
    .select('publish_date')
    .order('publish_date', { ascending: false })
    .limit(20);

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>Vikrand Times - Marathi Newspaper</title>
      <link>${baseUrl}</link>
      <description>Latest news and editions from Vikrand Times</description>
      <language>mr</language>
      <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
      ${
        editions
          ?.map((edition) => `
        <item>
          <title>Vikrand Times Edition - ${edition.publish_date}</title>
          <link>${baseUrl}/edition/${edition.publish_date}</link>
          <guid>${baseUrl}/edition/${edition.publish_date}</guid>
          <pubDate>${new Date(edition.publish_date).toUTCString()}</pubDate>
          <description>Read the Marathi weekly newspaper edition published on ${edition.publish_date}.</description>
        </item>
      `).join('') || ''
      }
    </channel>
  </rss>`;

  return new NextResponse(rssFeed, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
