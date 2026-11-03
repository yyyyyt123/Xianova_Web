"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLink, PageIntro, SectionLabel } from "../Editorial";

/** Keeps the existing mail-client handoff; no new contact API or mail service. */
export function Contact() {
  const t = useTranslations("contact");
  const footer = useTranslations("footer");
  const ui = useTranslations("experience");
  const [prepared, setPrepared] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "");
    const company = String(data.get("company") || "");
    const email = String(data.get("email") || "");
    const intent = String(data.get("intent") || "");
    const subject = encodeURIComponent(`[Xianova] ${company || name}`);
    const body = encodeURIComponent(`Name: ${name}\nCompany: ${company}\nEmail: ${email}\n\n${intent}`);
    window.location.href = `mailto:${footer("email")}?subject=${subject}&body=${body}`;
    setPrepared(true);
  }
  return <>
    <PageIntro index="05" label={t("label")} title={ui("contactTitle")} description={t("desc")} variant={2} />
    <section className="editorial-section"><div className="editorial-wrap contact-layout">
      <div className="contact-channels"><SectionLabel number="01">{ui("startConversation")}</SectionLabel><p className="contact-small-label">{t("emailLabel")}</p><a className="contact-direct-email" href={`mailto:${footer("email")}`}>{footer("email")}<span aria-hidden="true">↗</span></a><p className="contact-address">{footer("company")}<br />{footer("address")}</p><div className="contact-careers"><p>{ui("contactCareers")}</p><ArrowLink href="/careers">{ui("joinTeam")}</ArrowLink></div></div>
      <form onSubmit={submit} className="contact-form">
        <p className="contact-form-note">{ui("mailtoHint")}</p>
        <div className="contact-form-pair"><Field label={t("name")} name="name" required /><Field label={t("company")} name="company" /></div>
        <Field label={t("email")} name="email" type="email" required />
        <label htmlFor="contact-intent">{t("intent")} *<textarea id="contact-intent" name="intent" rows={5} required placeholder={t("intentPlaceholder")} /></label>
        <button type="submit" className="btn-primary">{ui("prepareEmail")}<span aria-hidden="true" className="ml-8">↗</span></button>
        {prepared && <p role="status" className="contact-status">{ui("emailPrepared")}</p>}
      </form>
    </div></section>
  </>;
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return <label htmlFor={`contact-${name}`}>{label}{required ? " *" : ""}<input id={`contact-${name}`} type={type} name={name} required={required} autoComplete={name === "company" ? "organization" : name} maxLength={name === "email" ? 254 : 150} /></label>;
}
