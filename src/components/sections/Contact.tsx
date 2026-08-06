"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { FadeIn } from "../FadeIn";

/**
 * Contact page with form and channels.
 */
export function Contact() {
  const t = useTranslations("contact");
  const footer = useTranslations("footer");
  const [sent, setSent] = useState(false);

  /**
   * Client-side mailto handoff until a backend is wired.
   * @param e, form submit event
   */
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "");
    const company = String(data.get("company") || "");
    const email = String(data.get("email") || "");
    const intent = String(data.get("intent") || "");
    const subject = encodeURIComponent(`[Xianova] ${company || name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nCompany: ${company}\nEmail: ${email}\n\n${intent}`
    );
    window.location.href = `mailto:${footer("email")}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <>
      <section className="relative overflow-hidden bg-deep pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="grain opacity-25" />
        <div className="max-prose-site relative px-8 md:px-12">
          <FadeIn>
            <p className="font-mono text-sm font-semibold text-sky">
              {t("label")}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-5 text-white/65">{t("desc")}</p>
          </FadeIn>
        </div>
      </section>

      <section className="bg-page section-pad">
        <div className="max-prose-site">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <FadeIn>
              <div className="space-y-8">
                <div>
                  <p className="label-mono text-ink-faint">{t("emailLabel")}</p>
                  <a
                    href={`mailto:${footer("email")}`}
                    className="mt-3 inline-block font-mono text-lg text-brand no-underline transition hover:opacity-80"
                  >
                    {footer("email")}
                  </a>
                </div>
                <div>
                  <p className="label-mono text-ink-faint">{t("wechatLabel")}</p>
                  <div className="mt-3 flex h-40 w-40 items-center justify-center border border-dashed border-line bg-surface font-mono text-[11px] text-ink-faint">
                    {t("wechatPlaceholder")}
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.08}>
              {sent ? (
                <p className="border border-brand/25 bg-brand/5 p-8 text-ink">
                  {t("success")}
                </p>
              ) : (
                <form
                  onSubmit={onSubmit}
                  className="space-y-5 border border-line bg-surface p-6 md:p-8"
                >
                  <Field label={t("name")} name="name" required />
                  <Field label={t("company")} name="company" />
                  <Field label={t("email")} name="email" type="email" required />
                  <div>
                    <label
                      htmlFor="intent"
                      className="mb-2 block label-mono text-ink-faint"
                    >
                      {t("intent")}
                    </label>
                    <textarea
                      id="intent"
                      name="intent"
                      required
                      rows={4}
                      placeholder={t("intentPlaceholder")}
                      className="w-full resize-none border border-line bg-page px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-faint focus:border-brand"
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    {t("submit")}
                  </button>
                </form>
              )}
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
};

/**
 * Labeled text input for the contact form.
 * @param label, visible label
 * @param name, input name
 * @param type, input type
 * @param required, whether required
 */
function Field({ label, name, type = "text", required }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block label-mono text-ink-faint">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full border border-line bg-page px-4 py-3 text-sm text-ink outline-none transition focus:border-brand"
      />
    </div>
  );
}
