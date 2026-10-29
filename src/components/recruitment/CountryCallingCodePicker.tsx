'use client';

import {useEffect, useId, useMemo, useRef, useState, type KeyboardEvent} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {getCountries, getCountryCallingCode, type CountryCode} from 'libphonenumber-js/min';
import 'country-flag-icons/3x2/flags.css';

const preferred: CountryCode[] = ['CN', 'HK', 'MO', 'TW', 'US', 'CA', 'GB', 'SG', 'JP', 'KR', 'AU'];
type Country = {iso: CountryCode; code: string; name: string; englishName: string};

function Flag({country}: {country: CountryCode | null}) {
  return country ? <span aria-hidden="true" className={`flag:${country} shrink-0 rounded-[2px] ring-1 ring-black/10`} style={{'--CountryFlagIcon-height': '16px'} as React.CSSProperties}/>
    : <svg aria-hidden="true" className="h-5 w-6 text-ink-mute" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>;
}

export function CountryCallingCodePicker() {
  const t = useTranslations('careers'), locale = useLocale();
  const id = useId(), container = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null), search = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState('+86'), [country, setCountry] = useState<CountryCode | null>('CN');
  const [open, setOpen] = useState(false), [query, setQuery] = useState(''), [active, setActive] = useState(0);
  const countries = useMemo(() => {
    const names = new Intl.DisplayNames([locale === 'zh' ? 'zh-CN' : 'en'], {type: 'region'});
    const englishNames = new Intl.DisplayNames(['en'], {type: 'region'});
    return getCountries().map(iso => ({iso, code: `+${getCountryCallingCode(iso)}`, name: names.of(iso) || iso, englishName: englishNames.of(iso) || iso}))
      .sort((a, b) => {
        const rankA = preferred.indexOf(a.iso), rankB = preferred.indexOf(b.iso);
        if (rankA !== -1 || rankB !== -1) return (rankA === -1 ? preferred.length : rankA) - (rankB === -1 ? preferred.length : rankB);
        return a.name.localeCompare(b.name, locale);
      });
  }, [locale]);
  const selected = countries.find(item => item.iso === country);
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return countries.filter(item => `${item.name} ${item.englishName} ${item.iso} ${item.code}`.toLocaleLowerCase().includes(term));
  }, [countries, query]);

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !container.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);
  useEffect(() => {
    if (open) document.getElementById(`${id}-option-${active}`)?.scrollIntoView({block: 'nearest'});
  }, [open, active, id]);

  function toggle() {
    if (!open) {setQuery(''); setActive(Math.max(0, countries.findIndex(item => item.iso === country)));}
    setOpen(!open);
  }
  function choose(item: Country) {
    setCode(item.code); setCountry(item.iso); setOpen(false); trigger.current?.focus();
  }
  function edit(value: string) {
    const normalized = value.replace(/\s/g, '');
    setCode(normalized);
    if (selected?.code !== normalized) setCountry(countries.find(item => item.code === normalized)?.iso || null);
  }
  function navigate(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(index => filtered.length ? (index + (event.key === 'ArrowDown' ? 1 : -1) + filtered.length) % filtered.length : 0);
    } else if (event.key === 'Enter') {
      event.preventDefault(); if (filtered[active]) choose(filtered[active]);
    } else if (event.key === 'Escape') {
      event.preventDefault(); setOpen(false); trigger.current?.focus();
    }
  }

  return <div ref={container} className="relative w-40 shrink-0 sm:w-44" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }}>
    <div className="flex h-full min-h-[58px] items-stretch border border-line bg-white focus-within:ring-2 focus-within:ring-brand/30">
      <input aria-label={t('countryCode')} name="phoneCountryCode" type="tel" inputMode="tel" autoComplete="tel-country-code" required pattern="\+[1-9][0-9]{0,2}" maxLength={4} value={code} onChange={event => edit(event.target.value)} className="min-w-0 flex-1 bg-transparent py-4 pl-4 pr-1 text-ink outline-none"/>
      <button ref={trigger} type="button" aria-label={`${t('chooseCountry')}${selected ? `: ${selected.name} ${selected.code}` : ''}`} title={selected?.name || t('chooseCountry')} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? `${id}-dialog` : undefined} onClick={toggle} onKeyDown={event => {
        if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {event.preventDefault(); toggle();}
      }} className="flex shrink-0 items-center gap-2 border-l border-line px-3 outline-offset-2 hover:bg-page">
        <Flag country={country}/><svg aria-hidden="true" className={`h-3 w-3 text-ink-mute transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m4 6 4 4 4-4"/></svg>
      </button>
    </div>
    {open && <div id={`${id}-dialog`} role="dialog" aria-label={t('chooseCountry')} className="absolute left-0 top-full z-30 mt-2 w-[min(22rem,calc(100vw-3rem))] overflow-hidden border border-line bg-white shadow-xl">
      <div className="border-b border-line p-3">
        <input ref={search} aria-label={t('searchCountry')} role="combobox" aria-expanded="true" aria-autocomplete="list" aria-controls={`${id}-list`} aria-activedescendant={filtered[active] ? `${id}-option-${active}` : undefined} value={query} onChange={event => {setQuery(event.target.value); setActive(0);}} onKeyDown={navigate} placeholder={t('searchCountry')} className="w-full border border-line bg-page px-3 py-3 text-sm font-normal outline-offset-2"/>
      </div>
      <ul id={`${id}-list`} role="listbox" aria-label={t('chooseCountry')} className="max-h-[min(20rem,45vh)] overflow-y-auto overscroll-contain p-1">
        {filtered.map((item, index) => <li key={item.iso} role="presentation"><button type="button" role="option" id={`${id}-option-${index}`} aria-selected={item.iso === country} tabIndex={-1} onMouseEnter={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => choose(item)} className={`flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-normal ${index === active ? 'bg-brand/10' : 'hover:bg-page'} ${item.iso === country ? 'text-brand' : 'text-ink'}`}>
          <Flag country={item.iso}/><span className="min-w-0 flex-1 break-words">{item.name}</span><span className="shrink-0 font-mono text-ink-mute">{item.code}</span>
        </button></li>)}
      </ul>
      {filtered.length === 0 && <p role="status" className="p-5 text-sm font-normal text-ink-mute">{t('noCountryResults')}</p>}
      <p className="border-t border-line px-4 py-3 text-xs font-normal leading-5 text-ink-mute">{t('countryCodeHelp')}</p>
    </div>}
  </div>;
}
