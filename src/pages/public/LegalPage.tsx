import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, FileText } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { PageHero } from '@/components/marketing/PageHero';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { legalDocs, isLegalSlug, legalSlugs } from '@/config/legal';
import { brand } from '@/config/brand';
import NotFoundPage from '@/pages/public/NotFoundPage';

export default function LegalPage() {
  const { slug } = useParams<{ slug: string }>();

  if (!isLegalSlug(slug)) {
    return <NotFoundPage />;
  }

  const doc = legalDocs[slug];

  return (
    <>
      <SEO
        title={doc.title}
        description={doc.summary}
        path={`/legal/${doc.slug}`}
        noIndex
      />

      <PageHero
        eyebrow="Legal"
        title={doc.title}
        description={doc.summary}
        backTo="/"
        backLabel="Back to home"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="warn">
            <AlertTriangle className="h-3 w-3" aria-hidden="true" /> Draft — pending legal review
          </Badge>
          <Badge variant="soft">Last updated {doc.updated}</Badge>
        </div>
      </PageHero>

      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-charcoal-400">
              On this page
            </p>
            <nav aria-label="On this page" className="mt-3 space-y-1.5">
              {doc.sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() =>
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                  className="block text-left text-[12.5px] leading-snug text-charcoal-600 transition-colors hover:text-forest"
                >
                  {section.heading}
                </button>
              ))}
            </nav>

            <div className="mt-6 border-t border-forest/10 pt-4">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-charcoal-400">
                Other documents
              </p>
              <ul className="mt-2 space-y-1.5">
                {legalSlugs
                  .filter((item) => item !== doc.slug)
                  .map((item) => (
                    <li key={item}>
                      <Link
                        to={`/legal/${item}`}
                        className="flex items-center gap-1.5 text-[12.5px] text-forest/80 hover:text-forest"
                      >
                        <FileText className="h-3 w-3" aria-hidden="true" />
                        {legalDocs[item].title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          </aside>

          <div className="max-w-3xl">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[12.5px] leading-relaxed text-amber-900">
              <strong className="font-semibold">Draft for internal review.</strong> This document was
              written for a partner demo and must be reviewed by a qualified lawyer before launch.
              It is not legal advice.
            </div>

            <article className="mt-8 space-y-8">
              {doc.sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-28">
                  <h2 className="font-display text-lg font-bold text-forest">{section.heading}</h2>
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph} className="mt-3 text-[14px] leading-7 text-charcoal-600">
                      {paragraph}
                    </p>
                  ))}
                  {section.bullets && (
                    <ul className="mt-3 space-y-2">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2.5 text-[14px] leading-7 text-charcoal-600">
                          <span className="mt-3 h-1 w-1 shrink-0 rounded-full bg-terracotta" aria-hidden="true" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </article>

            <div className="mt-10 rounded-2xl border border-forest/10 bg-cream-100/70 p-5">
              <p className="text-[12px] leading-relaxed text-charcoal-600">{brand.medicalFootnote}</p>
              <p className="mt-3 text-[11.5px] text-charcoal-500">
                Questions? Email{' '}
                <a
                  href={`mailto:${brand.email}`}
                  className="font-medium text-forest underline decoration-sage-400 underline-offset-4"
                >
                  {brand.email}
                </a>
                .
              </p>
            </div>

            <Button asChild variant="ghost" className="mt-6 px-0">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to home
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
