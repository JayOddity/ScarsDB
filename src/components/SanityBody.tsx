'use client';

import { PortableText, type PortableTextComponents } from 'next-sanity';
import { urlFor } from '@/lib/sanity';

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => <h1 className="font-heading text-3xl text-honor-gold mt-8 mb-4">{children}</h1>,
    h2: ({ children }) => <h2 className="font-heading text-2xl text-honor-gold mt-8 mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="font-heading text-xl text-parchment mt-6 mb-2">{children}</h3>,
    h4: ({ children }) => <h4 className="font-heading text-lg text-parchment mt-4 mb-2">{children}</h4>,
    normal: ({ children }) => <p className="text-text-secondary leading-relaxed mb-4">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-honor-gold-dim pl-4 my-6 text-text-secondary italic">{children}</blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc list-inside space-y-1 text-text-secondary mb-4 ml-4">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-text-secondary mb-4 ml-4">{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong className="text-text-primary font-semibold">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => (
      <a href={value?.href} className="text-honor-gold hover:text-honor-gold-light underline transition-colors" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-6">
          <img
            src={urlFor(value).width(800).url()}
            alt={value.alt || ''}
            className="rounded-lg w-full"
          />
          {value.alt && <figcaption className="text-sm text-text-muted mt-2 text-center">{value.alt}</figcaption>}
        </figure>
      );
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SanityBody({ value }: { value: any[] }) {
  if (!value) return null;
  return (
    <div className="prose-scars">
      <PortableText value={value} components={components} />
    </div>
  );
}
