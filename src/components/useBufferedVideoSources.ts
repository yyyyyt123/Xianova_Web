"use client";

import { useEffect, useState } from "react";

/** Download complete video bodies and reuse them as the player's sources. */
export function useBufferedVideoSources(urls: readonly string[]) {
  const [buffered, setBuffered] = useState<{
    urls: readonly string[];
    sources: Record<string, string>;
  }>();

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const objectUrls: string[] = [];

    async function download(url: string) {
      try {
        const response = await fetch(url, { signal });
        if (!response.ok) return [url, url] as const;
        const blob = await response.blob();
        if (signal.aborted) return [url, url] as const;
        const source = URL.createObjectURL(blob);
        objectUrls.push(source);
        return [url, source] as const;
      } catch {
        // A failed background request can still use the native network player.
        return [url, url] as const;
      }
    }

    void Promise.all(urls.map(download)).then(entries => {
      if (!signal.aborted) setBuffered({ urls, sources: Object.fromEntries(entries) });
    });

    return () => {
      controller.abort();
      for (const url of objectUrls) URL.revokeObjectURL(url);
    };
  }, [urls]);

  return buffered?.urls === urls ? buffered.sources : undefined;
}
