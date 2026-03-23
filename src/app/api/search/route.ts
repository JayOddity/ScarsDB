import { NextRequest, NextResponse } from 'next/server';
import { sanityClient } from '@/lib/sanity';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ results: [] });

  const results = await sanityClient.fetch(
    `*[
      (_type == "article" || _type == "newsPost" || _type == "page") &&
      (title match $search || excerpt match $search)
    ] | order(publishedAt desc) [0...6] {
      _type,
      title,
      "slug": slug.current,
      excerpt,
      category
    }`,
    { search: `*${q}*` }
  );

  const mapped = (results as Array<{
    _type: string;
    title: string;
    slug: string;
    excerpt?: string;
    category?: string;
  }>).map((r) => {
    const typeMap: Record<string, string> = {
      article: 'articles',
      newsPost: 'news',
      page: 'pages',
    };
    return {
      type: 'page',
      name: r.title,
      description: r.excerpt || r.category || r._type,
      href: `/${typeMap[r._type] || 'pages'}/${r.slug}`,
    };
  });

  return NextResponse.json({ results: mapped });
}
