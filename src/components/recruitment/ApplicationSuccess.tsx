'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/routing';

export function ApplicationSuccess() {
  const t = useTranslations('careers');

  return <section className="flex min-h-[75vh] items-center justify-center px-6 pb-20 pt-36 md:px-12 md:pb-28 md:pt-44">
    <div className="w-full max-w-3xl text-center">
      <div aria-hidden="true" className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
        <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6"/></svg>
      </div>
      <h1 role="status" className="text-2xl font-semibold leading-relaxed text-ink md:text-4xl">{t('submitted')}</h1>
      <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
        <Link href="/careers" className="btn-primary">{t('backToList')}</Link>
        <Link href="/" className="inline-flex h-11 items-center justify-center border border-line px-6 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-ink no-underline transition hover:border-brand hover:text-brand">{t('backToHome')}</Link>
      </div>
    </div>
  </section>;
}
