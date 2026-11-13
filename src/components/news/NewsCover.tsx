"use client";

import Image from "next/image";
import { useState } from "react";
import { publicAsset } from "@/lib/public-asset";

export function NewsCover({ source }: { source?: string }) {
  const [failedSource, setFailedSource] = useState<string>();

  return (
    <div className="news-cover" aria-hidden="true">
      <span className="news-cover-wordmark">XIANOVA</span>
      {source && source !== failedSource && (
        <Image
          src={source.startsWith("/") ? publicAsset(source) : source}
          alt=""
          fill
          unoptimized
          referrerPolicy="no-referrer"
          onError={() => setFailedSource(source)}
        />
      )}
    </div>
  );
}
