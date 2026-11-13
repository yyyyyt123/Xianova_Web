import "server-only";
import { unstable_cache } from "next/cache";
import { curatedNews } from "./curated-news";

export type NewsArticle = {
  id: string;
  title: string;
  summary?: string;
  image?: string;
  url?: string;
  date?: string;
  dateIsUpdate?: boolean;
  language: "zh" | "en";
};

type NewsFeed =
  | { status: "live" | "curated"; articles: NewsArticle[] }
  | { status: "empty" | "unavailable"; articles: [] };

const API_ORIGIN = "https://api.weixin.qq.com";
const PAGE_SIZE = 20;
const MAX_RECENT_PUBLICATIONS = 100;

type WeChatArticle = {
  title?: unknown;
  digest?: unknown;
  url?: unknown;
  article_url?: unknown;
  thumb_url?: unknown;
  is_deleted?: unknown;
  publish_time?: unknown;
};

type WeChatBatch = {
  update_time?: unknown;
  content?: { news_item?: WeChatArticle[] };
};

function cleanText(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, limit) : "";
}

function wechatUrl(value: unknown, kind: "article" | "image") {
  if (typeof value !== "string" || value.length > 2048) return undefined;
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.port) return undefined;

    if (kind === "article") {
      if (url.hostname !== "mp.weixin.qq.com" || !/^\/s(?:\/[\w-]+)?$/.test(url.pathname)) return undefined;
      if (Array.from(url.searchParams.keys()).some((key) => /^(tempkey|preview|access_token)$/i.test(key))) return undefined;
      if (url.pathname === "/s" && !(url.searchParams.has("__biz") && url.searchParams.has("mid") && url.searchParams.has("idx") && url.searchParams.has("sn"))) return undefined;
    } else if (!/^mmbiz(?:\.qpic|\.qlogo)\.cn$/.test(url.hostname)) {
      return undefined;
    }
    url.protocol = "https:";
    url.hash = "";
    return url.href;
  } catch {
    return undefined;
  }
}

function timestamp(value: unknown) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0 || value > 253402300799) return undefined;
  return new Date(value * 1000).toISOString();
}

async function wechatPost<T extends object>(path: string, body: object, signal: AbortSignal): Promise<T> {
  let data: T & { errcode?: number };
  try {
    const response = await fetch(API_ORIGIN + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      redirect: "error",
      signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
  } catch {
    // Upstream exceptions can include a request URL or payload with credentials.
    throw new Error("WeChat request failed");
  }
  if (!data || typeof data !== "object") throw new Error("Invalid WeChat response");
  if (data.errcode !== undefined && data.errcode !== 0) {
    throw new Error(Number.isSafeInteger(data.errcode) ? `WeChat API error ${data.errcode}` : "WeChat API error");
  }
  return data;
}

const syncPublishedArticles = unstable_cache(async (appId: string): Promise<NewsArticle[]> => {
  const secret = process.env.WECHAT_OFFICIAL_APP_SECRET?.trim();
  if (!secret) throw new Error("WeChat AppSecret is missing");
  const signal = AbortSignal.timeout(8000);
  const token = await wechatPost<{ access_token?: string }>("/cgi-bin/stable_token", {
    grant_type: "client_credential",
    appid: appId,
    secret,
    force_refresh: false,
  }, signal);
  if (typeof token.access_token !== "string" || !token.access_token) throw new Error("WeChat token is missing");

  const articles = new Map<string, NewsArticle>();
  for (let offset = 0; offset < MAX_RECENT_PUBLICATIONS;) {
    const batch = await wechatPost<{ item?: WeChatBatch[]; item_count?: number; total_count?: number }>(
      `/cgi-bin/freepublish/batchget?access_token=${encodeURIComponent(token.access_token)}`,
      { offset, count: PAGE_SIZE, no_content: 1 },
      signal,
    );
    if (!Array.isArray(batch.item) && batch.item_count !== 0 && batch.total_count !== 0) {
      throw new Error("WeChat list response is missing article batches");
    }
    const items = Array.isArray(batch.item) ? batch.item : [];
    for (const item of items) {
      if (!Array.isArray(item?.content?.news_item)) throw new Error("WeChat batch is missing articles");
      for (const article of item.content.news_item) {
        if (!article || article.is_deleted === true || article.is_deleted === 1) continue;
        const url = wechatUrl(article.article_url, "article") ?? wechatUrl(article.url, "article");
        const title = cleanText(article.title, 300);
        if (!url || !title || articles.has(url)) continue;
        const published = timestamp(article.publish_time);
        const updated = timestamp(item.update_time);
        articles.set(url, {
          id: url,
          url,
          title,
          summary: cleanText(article.digest, 320),
          image: wechatUrl(article.thumb_url, "image"),
          date: published ?? updated,
          dateIsUpdate: !published && Boolean(updated),
          language: /[\u3400-\u9fff]/.test(title) ? "zh" : "en",
        });
      }
    }
    offset += items.length;
    if (!items.length || offset >= (batch.total_count ?? Infinity)) break;
    if (batch.total_count === undefined && items.length < PAGE_SIZE) break;
  }

  return Array.from(articles.values()).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}, ["wechat-official-news-v1"], { revalidate: 600 });

export async function getNewsFeed(): Promise<NewsFeed> {
  const appId = process.env.WECHAT_OFFICIAL_APP_ID?.trim();
  const secret = process.env.WECHAT_OFFICIAL_APP_SECRET?.trim();
  if (!appId || !secret) {
    return { status: "curated", articles: curatedNews };
  }

  try {
    const articles = await syncPublishedArticles(appId);
    return articles.length ? { status: "live", articles } : { status: "empty", articles: [] };
  } catch (error) {
    console.warn("[news]", error instanceof Error ? error.message : "WeChat sync failed");
    return { status: "unavailable", articles: [] };
  }
}
