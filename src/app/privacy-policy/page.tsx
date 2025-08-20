import Link from 'next/link';

import { readFileSync } from 'fs';
import { Calendar } from 'lucide-react';
import { compileMDX } from 'next-mdx-remote/rsc';
import { join } from 'path';

import CategoryBadge from '@/components/category-badge';

interface Frontmatter {
  title: string;
  description: string;
  date: string;
}

export default async function PrivacyPolicy() {
  // Read the MDX file
  const filePath = join(process.cwd(), './src/app/privacy-policy/index.mdx');
  const source = readFileSync(filePath, 'utf8');

  // Compile the MDX content
  const { content, frontmatter } = await compileMDX<Frontmatter>({
    source,
    options: { parseFrontmatter: true },
  });

  return (
    <article className="hero-padding-margin container max-w-4xl space-y-6 md:space-y-8">
      {/* Back button */}
      <div className="flex flex-col items-center justify-center gap-4">
        <Link href="/" className="group">
          <CategoryBadge
            label={new Date(frontmatter.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
            icon={<Calendar className="!text-current" />}
          />
        </Link>
        <h1 className="text-center text-2xl md:text-4xl lg:text-5xl">{frontmatter.title}</h1>
      </div>

      <div className="prose prose-2xl prose-headings:text-2xl dark:prose-invert max-w-none leading-8">
        {content}
      </div>
    </article>
  );
}
