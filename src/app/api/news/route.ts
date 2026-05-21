import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');

    if (!country) {
      return NextResponse.json({ error: 'Country parameter is required' }, { status: 400 });
    }

    // Focused search query for crises/disasters related to the country
    const query = encodeURIComponent(`"${country}" (disaster OR crisis OR emergency OR earthquake OR hurricane OR flood OR wildfire)`);
    const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

    const feed = await parser.parseURL(rssUrl);

    // Get the top 4 most recent articles
    const articles = feed.items.slice(0, 4).map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      source: item.source || 'Google News'
    }));

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
