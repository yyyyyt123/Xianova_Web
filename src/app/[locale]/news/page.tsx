import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewsCover } from "@/components/news/NewsCover";
import { getNewsFeed } from "@/lib/wechat-news";
import "./news.css";

type Props = { params: { locale: string } };

// Regenerate on demand and share the last successful list across both locales.
export const revalidate = 600;

const mixedScriptBoundary = new RegExp(String.raw`\p{Script=Han}(?=[A-Za-z])|[A-Za-z](?=\p{Script=Han})`, "gu");

function spaceMixedText(text: string) {
  return text.replace(mixedScriptBoundary, "$& ");
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "news" });
  return {
    title: `${t("title")} | Xianova Robotics`,
    description: t("intro"),
    alternates: { canonical: "/news" },
  };
}

export default async function NewsPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const [t, feed] = await Promise.all([
    getTranslations({ locale, namespace: "news" }),
    getNewsFeed(),
  ]);
  const dateFormat = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
    year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Shanghai",
  });

  return (
    <div className="news-page">
      <section className="page-intro">
        <div className="editorial-wrap">
          <p className="eyebrow">XIANOVA / NEWS</p>
          <h1>{t("title")}</h1>
          <p className="page-intro-description">{t("intro")}</p>
        </div>
      </section>
      <section className="news-feed" aria-labelledby="news-feed-title">
        <div className="editorial-wrap">
          <div className="news-feed-heading">
            <h2 id="news-feed-title">{t("list")}</h2>
            <p>{t("source")}</p>
          </div>
          {feed.status === "empty" || feed.status === "unavailable" ? (
            <p className="news-empty">{t(feed.status)}</p>
          ) : (
            <ul className="news-list">
              {feed.articles.map((article) => {
                const date = article.date && dateFormat.format(new Date(article.date));
                const title = spaceMixedText(article.title);
                return (
                  <li key={article.id}>
                    <article className="news-article">
                      <NewsCover source={article.image} />
                      <div className="news-article-copy">
                        {date && <time dateTime={article.date}>{article.dateIsUpdate ? t("updated", { date }) : date}</time>}
                        <h3 lang={article.language}>
                          {article.url ? (
                            <a href={article.url} target="_blank" rel="noopener noreferrer">{title}</a>
                          ) : title}
                        </h3>
                        {article.summary && <p lang={article.language}>{spaceMixedText(article.summary)}</p>}
                        {article.url && (
                          <a className="arrow-link news-article-link" href={article.url} target="_blank" rel="noopener noreferrer">
                            {t("read")}<span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
