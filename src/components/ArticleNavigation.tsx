import Link from "next/link";
import { withLocalePrefix } from "@/i18n/config";
import { useI18n } from "@/i18n/useI18n";

export type ArticleNavItem = {
  slug: string;
  title: string;
  excerpt?: string | null;
  category?: string | null;
};

export type ArticleNavigationData = {
  previous: ArticleNavItem | null;
  next: ArticleNavItem | null;
  related: ArticleNavItem[];
};

type ArticleNavigationProps = {
  navigation: ArticleNavigationData | null;
};

function NavLink({ label, item }: { label: string; item: ArticleNavItem | null }) {
  const { locale } = useI18n();

  if (!item) {
    return (
      <div className="border-t border-outline-variant/10 py-8 opacity-50">
        <div className="label-mono mb-3">{label}</div>
        <p className="font-serif text-headline-md text-on-background">No entry.</p>
      </div>
    );
  }

  return (
    <Link className="group border-t border-outline-variant/10 py-8 transition hover:-translate-y-1" href={withLocalePrefix(`/journal/${item.slug}`, locale)}>
      <div className="label-mono mb-3">{label}</div>
      <h3 className="font-serif text-headline-md text-on-background transition group-hover:text-secondary">{item.title}</h3>
      {item.excerpt ? <p className="mt-3 text-body-md text-on-surface-variant">{item.excerpt}</p> : null}
    </Link>
  );
}

export default function ArticleNavigation({ navigation }: ArticleNavigationProps) {
  const { locale, dictionary } = useI18n();

  if (!navigation) {
    return null;
  }

  return (
    <section className="mt-24 border-t border-outline-variant/10 pt-12">
      <div className="grid gap-gutter md:grid-cols-2">
        <NavLink label={dictionary.common.previousArticle} item={navigation.previous} />
        <NavLink label={dictionary.common.nextArticle} item={navigation.next} />
      </div>

      {navigation.related.length > 0 ? (
        <div className="mt-16">
          <div className="label-mono mb-8">{dictionary.common.relatedArticles}</div>
          <div className="grid gap-gutter md:grid-cols-2">
            {navigation.related.map((item) => (
              <Link key={item.slug} className="group border-t border-outline-variant/10 py-7 transition hover:-translate-y-1" href={withLocalePrefix(`/journal/${item.slug}`, locale)}>
                <div className="label-mono mb-3">{item.category || "Journal"}</div>
                <h3 className="font-serif text-headline-md text-on-background transition group-hover:text-secondary">{item.title}</h3>
                {item.excerpt ? <p className="mt-3 text-body-md text-on-surface-variant">{item.excerpt}</p> : null}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
