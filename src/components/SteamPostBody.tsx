'use client';

function steamToHtml(text: string): string {
  let html = text;

  // YouTube embeds
  html = html.replace(/\[previewyoutube="?([\w-]+);?[^"]*"?\]\s*\[\/previewyoutube\]/g,
    '<div class="my-4 aspect-video"><iframe src="https://www.youtube.com/embed/$1" class="w-full h-full rounded" allowfullscreen loading="lazy"></iframe></div>');

  // Steam clan images
  html = html.replace(/\{STEAM_CLAN_IMAGE\}/g, 'https://clan.akamai.steamstatic.com/images');

  // Images
  html = html.replace(/\[img\s+src="([^"]+)"\]\s*\[\/img\]/g, '<img src="$1" alt="" class="rounded my-3 max-w-full" />');
  html = html.replace(/\[img\](.*?)\[\/img\]/g, '<img src="$1" alt="" class="rounded my-3 max-w-full" />');

  // Headings
  html = html.replace(/\[h1\]([\s\S]*?)\[\/h1\]/g, '<h2 class="font-heading text-lg text-honor-gold mt-4 mb-2">$1</h2>');
  html = html.replace(/\[h2\]([\s\S]*?)\[\/h2\]/g, '<h3 class="font-heading text-base text-parchment mt-3 mb-1">$1</h3>');
  html = html.replace(/\[h3\]([\s\S]*?)\[\/h3\]/g, '<h4 class="font-heading text-sm text-parchment mt-2 mb-1">$1</h4>');

  // Inline formatting
  html = html.replace(/\[b\]([\s\S]*?)\[\/b\]/g, '<strong>$1</strong>');
  html = html.replace(/\[i\]([\s\S]*?)\[\/i\]/g, '<em>$1</em>');
  html = html.replace(/\[u\]([\s\S]*?)\[\/u\]/g, '<u>$1</u>');
  html = html.replace(/\[strike\]([\s\S]*?)\[\/strike\]/g, '<s>$1</s>');

  // Links
  html = html.replace(/\[url=([^\]]+)\]([\s\S]*?)\[\/url\]/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-honor-gold hover:text-honor-gold-light underline">$2</a>');

  // Lists
  html = html.replace(/\[list\]/g, '<ul class="list-disc pl-5 space-y-1 my-2">');
  html = html.replace(/\[\/list\]/g, '</ul>');
  html = html.replace(/\[\*\]([\s\S]*?)\[\/\*\]/g, '<li>$1</li>');
  html = html.replace(/\[\*\]/g, '<li>');

  // Paragraphs
  html = html.replace(/\[p\]\s*\[\/p\]/g, '');
  html = html.replace(/\[p\]/g, '<p class="mb-2">');
  html = html.replace(/\[\/p\]/g, '</p>');

  // Clean up remaining tags
  html = html.replace(/\[\/?[a-z_]+\]/g, '');

  // Collapse excessive breaks
  html = html.replace(/(<br\s*\/?>){3,}/g, '<br /><br />');
  html = html.replace(/\n/g, '<br />');

  return html;
}

export default function SteamPostBody({ contents }: { contents: string }) {
  return (
    <div
      className="text-sm text-text-secondary leading-relaxed prose-steam"
      dangerouslySetInnerHTML={{ __html: steamToHtml(contents) }}
    />
  );
}
