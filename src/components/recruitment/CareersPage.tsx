'use client';

import {useEffect, useRef, useState, FormEvent} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {Link, useRouter} from '@/i18n/routing';
import {Job, FormConfig, Receipt, RecruitmentError, recruitmentApi, jobText, hasJobTranslationFallback} from '@/lib/recruitment';
import {validateResume} from '@/lib/recruitment-upload.mjs';
import {SafeJobText} from './SafeJobText';
import {CountryCallingCodePicker} from './CountryCallingCodePicker';
import {ApplicationSuccess} from './ApplicationSuccess';
import {startVisibleJobsRefresh} from '@/lib/visible-jobs-refresh.mjs';

type Credentials = {key: string; token: string};
export function CareersPage({jobId, apply=false, initialJobs, initialJobsAt}: {jobId?: string; apply?: boolean; initialJobs?: Job[]; initialJobsAt?: number}) {
  const t=useTranslations('careers'),locale=useLocale(),router=useRouter();
  const [jobs,setJobs]=useState<Job[]>(initialJobs??[]),[job,setJob]=useState<Job|null>(null),[config,setConfig]=useState<FormConfig|null>(null);
  const [loading,setLoading]=useState(initialJobs===undefined),[error,setError]=useState(''),[fileError,setFileError]=useState(''),[busy,setBusy]=useState(false),[file,setFile]=useState<File|null>(null),[submitted,setSubmitted]=useState(false);
  const credentials=useRef<Credentials|null>(null),fileInput=useRef<HTMLInputElement>(null);
  const [keyword,setKeyword]=useState('');
  const [listUpdateFailed,setListUpdateFailed]=useState(false),[listRefreshing,setListRefreshing]=useState(false);
  const retryJobs=useRef<(() => Promise<void>)|null>(null);
  const storageKey=`xianova-recruitment:${jobId}`;
  function requestError(error:unknown){
    if(!(error instanceof RecruitmentError))return t('networkError');
    if(locale!=='en')return error.message;
    const key=`requestErrors.${error.code}`;
    return t(t.has(key)?key:'requestErrors.DEFAULT');
  }
  useEffect(()=>{
    let cancelled=false;
    if(!jobId){
      let hasJobs=initialJobs!==undefined;
      let activeRequest:AbortController|undefined;
      if(initialJobs!==undefined){setJobs(initialJobs);setLoading(false);}
      setListUpdateFailed(false);setListRefreshing(false);setError('');
      const refreshJobs=async()=>{
        if(cancelled)return;
        setListRefreshing(true);
        if(!hasJobs){setLoading(true);setError('');}
        const controller=new AbortController();activeRequest=controller;
        const timeout=setTimeout(()=>controller.abort(),15000);
        try{
          const result=await recruitmentApi<{records:Job[]}>('/jobs?pageSize=100',{signal:controller.signal});
          if(!Array.isArray(result.records))throw new Error('Invalid jobs response');
          if(cancelled)return;
          setJobs(current=>JSON.stringify(current)===JSON.stringify(result.records)?current:result.records);
          hasJobs=true;setListUpdateFailed(false);setError('');
        }catch{
          if(!cancelled){if(hasJobs)setListUpdateFailed(true);else setError(t('loadError'));}
        }finally{clearTimeout(timeout);activeRequest=undefined;if(!cancelled){setLoading(false);setListRefreshing(false);}}
      };
      const refresh=startVisibleJobsRefresh({refresh:refreshJobs,lastCheckedAt:hasJobs?(initialJobsAt??0):0});
      retryJobs.current=()=>refresh.check(true);
      return()=>{cancelled=true;retryJobs.current=null;refresh.dispose();activeRequest?.abort();};
    }
    async function load(){
      try {
        if(jobId){const [j,c]=await Promise.all([recruitmentApi<Job>(`/jobs/${encodeURIComponent(jobId)}`),recruitmentApi<FormConfig>('/form-config')]);if(cancelled)return;setJob(j);setConfig(c);
          if(apply){const saved=sessionStorage.getItem(storageKey);if(saved){try{const parsed=JSON.parse(saved) as Credentials;credentials.current=parsed;await checkStatus(parsed);if(!cancelled)submissionCompleted();}catch(e){if(e instanceof SyntaxError||(e instanceof RecruitmentError&&e.status===403)){sessionStorage.removeItem(storageKey);credentials.current=null;}else if(!cancelled)setError(t('networkError'));}}}
        }
      }catch(e){if(!cancelled)setError(e instanceof RecruitmentError&&e.code==='JOB_CLOSED'?t('closed'):t('loadError'));}
      finally{if(!cancelled)setLoading(false);}
    } void load();return()=>{cancelled=true;};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[jobId,apply,locale,initialJobs,initialJobsAt]);
  async function checkStatus(c:Credentials){return recruitmentApi<Receipt>('/applications/status',{method:'POST',headers:{'Content-Type':'application/json','X-Application-Token':c.token},body:JSON.stringify({idempotencyKey:c.key})});}
  function chooseFile(chosen:File|null){const code=validateResume(chosen,config?.maxFileBytes);setFileError(code?t(`fileErrors.${code}`):'');setFile(code?null:chosen);if(code&&fileInput.current)fileInput.current.value='';}
  function getCredentials(){if(!credentials.current){const bytes=crypto.getRandomValues(new Uint8Array(32));credentials.current={key:crypto.randomUUID(),token:Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')};sessionStorage.setItem(storageKey,JSON.stringify(credentials.current));}return credentials.current;}
  function submissionCompleted(){
    credentials.current=null;sessionStorage.removeItem(storageKey);
    setFile(null);setFileError('');setError('');setSubmitted(true);
    router.replace(`/careers/${jobId}/apply/success`);
  }
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy)return;
    // 提交之前再次检查，永不把已知超限文件加入网络请求。
    const code=validateResume(file,config?.maxFileBytes);if(code){setFileError(t(`fileErrors.${code}`));return;}
    if(!config?.submissionEnabled||(locale==='en'&&!config.privacyTextEn)){setError(t('disabled'));return;}
    const form=new FormData(event.currentTarget),c=getCredentials();form.set('resume',file!);form.set('jobId',jobId!);form.set('privacyVersion',config.privacyVersion);form.set('idempotencyKey',c.key);form.set('submissionToken',c.token);
    setBusy(true);setError('');
    try {await recruitmentApi<Receipt>('/applications',{method:'POST',body:form});submissionCompleted();}
    catch(e){setError(requestError(e));try{await checkStatus(c);submissionCompleted();}catch{/* 保留表单和幂等凭据供原请求重试。 */}}
    finally{setBusy(false);}
  }
  if(submitted)return <ApplicationSuccess/>;
  const title=job?jobText(job.title,locale):t('title');
  return <>
    <section className="relative overflow-hidden bg-deep px-6 pb-14 pt-32 text-white md:px-12 md:pb-20 md:pt-40"><div className="max-site"><p className="label-mono mb-5 text-sky">XIANOVA / {t('eyebrow')}</p><h1 className="max-w-4xl text-3xl font-semibold leading-tight md:text-5xl">{apply?t('applyTitle'):title}</h1><p className="mt-5 max-w-2xl leading-8 text-white/65">{job?`${jobText(job.location,locale)} · ${t(`types.${job.employmentType}`)}`:t('intro')}</p></div></section>
    <section className="section-pad !py-12"><div className="max-site">
      {jobId&&<Link href={apply?`/careers/${jobId}`:'/careers'} className="label-mono mb-8 inline-block text-brand">← {apply?t('backToJob'):t('backToList')}</Link>}
      {loading&&<p role="status" className="py-16 text-ink-mute">{t('loading')}</p>}
      {error&&<div role="alert" className="mb-6 border-l-4 border-red-600 bg-red-50 p-5 text-red-800">{error}{!jobId&&<button type="button" disabled={listRefreshing} onClick={()=>void retryJobs.current?.()} className="ml-4 underline disabled:opacity-50">{listRefreshing?t('updatingJobs'):t('retryJobs')}</button>}</div>}
      {!jobId&&listUpdateFailed&&<div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-line bg-white px-4 py-3 text-sm leading-6 text-ink-mute"><span>{t('jobsUpdateFailed')}</span><button type="button" disabled={listRefreshing} onClick={()=>void retryJobs.current?.()} className="shrink-0 text-brand underline disabled:opacity-50">{listRefreshing?t('updatingJobs'):t('retryJobs')}</button></div>}
      {job&&hasJobTranslationFallback(job,locale)&&<p role="note" className="mb-8 border-l-2 border-brand bg-white p-4 text-sm leading-7 text-ink-mute">{t('translationFallback')}</p>}
      {!loading&&!error&&!jobId&&<><div className="mb-8 flex flex-wrap items-end justify-between gap-5"><h2 className="text-2xl font-semibold">{t('openings')} <span className="ml-2 font-mono text-sm text-ink-faint">{jobs.length.toString().padStart(2,'0')}</span></h2><label className="text-sm text-ink-mute">{t('search')}<input className="ml-3 border border-line bg-white px-4 py-3 text-ink" value={keyword} onChange={e=>setKeyword(e.target.value)}/></label></div><div className="border-t border-line">{jobs.filter(j=>`${jobText(j.title,locale)} ${jobText({zh:j.department||'',en:j.departmentEn},locale)}`.toLowerCase().includes(keyword.toLowerCase())).map(j=><Link key={j.jobId} href={`/careers/${j.jobId}`} className="group flex flex-col justify-between gap-5 border-b border-line px-2 py-8 no-underline transition hover:bg-white md:flex-row md:items-center"><div><p className="label-mono mb-3 text-brand">{jobText({zh:j.department||'',en:j.departmentEn},locale)||t('team')}</p><h3 className="text-xl font-semibold text-ink group-hover:text-brand md:text-2xl">{jobText(j.title,locale)}</h3><p className="mt-3 text-sm text-ink-mute">{jobText(j.location,locale)} · {t(`types.${j.employmentType}`)}</p>{hasJobTranslationFallback(j,locale)&&<p className="mt-2 text-xs text-ink-faint">{t('translationFallbackShort')}</p>}</div><span className="label-mono text-brand">{t('viewJob')} ↗</span></Link>)}</div>{jobs.length===0&&<p className="py-20 text-ink-mute">{t('empty')}</p>}</>}
      {job&&!apply&&<div className="grid gap-12 lg:grid-cols-[1fr_280px]"><article><h2 className="mb-6 text-2xl font-semibold">{t('responsibilities')}</h2><SafeJobText text={jobText(job.responsibilities,locale)}/><h2 className="mb-6 mt-12 text-2xl font-semibold">{t('requirements')}</h2><SafeJobText text={jobText(job.requirements,locale)}/></article><aside className="h-fit border border-line bg-white p-7 lg:sticky lg:top-28"><p className="label-mono text-brand">{t('position')}</p><h3 className="mb-6 mt-4 text-xl font-semibold">{title}</h3><p className="mb-6 text-sm text-ink-mute">{jobText(job.location,locale)}<br/>{t(`types.${job.employmentType}`)}</p><Link href={`/careers/${jobId}/apply`} className="btn-primary w-full">{t('apply')}</Link></aside></div>}
      {job&&apply&&config&&<div className="mx-auto max-w-3xl">
        <div className="mb-8 border-b border-line pb-6"><p className="label-mono text-brand">{t('position')}</p><h2 className="mt-3 text-2xl font-semibold">{title}</h2><p className="mt-3 text-sm text-ink-mute">{t('formIntro')}</p></div>
        {!config.submissionEnabled&&<p role="alert" className="mb-6 text-red-700">{t('disabled')}</p>}
        <form onSubmit={submit} className="space-y-8" aria-busy={busy}>
          <div className="grid gap-6 md:grid-cols-2">{(['name','email'] as const).map(name=><label key={name} className="block text-sm font-medium">{t(name)} *<input name={name} type={name==='email'?'email':'text'} required maxLength={name==='email'?254:100} className="mt-3 block w-full rounded-none border border-line bg-white p-4 outline-offset-2" autoComplete={name}/></label>)}</div>
          <div className="text-sm font-medium"><p>{t('phone')} *</p><div className="mt-3 flex gap-3"><CountryCallingCodePicker/><input aria-label={t('phone')} name="phone" required type="tel" inputMode="tel" pattern="[0-9 -]{6,20}" maxLength={20} autoComplete="tel-national" className="min-w-0 flex-1 border border-line bg-white p-4"/></div></div>
          <label className="block text-sm font-medium">{t('message')}<textarea name="message" rows={4} maxLength={2000} className="mt-3 block w-full border border-line bg-white p-4"/></label>
          <div><label htmlFor="resume" className="mb-3 block text-sm font-medium">{t('resume')} *</label><div className="border border-dashed border-line bg-white p-7"><input ref={fileInput} id="resume" name="resume" type="file" accept=".pdf,.docx" aria-describedby="resume-help resume-error" onChange={e=>chooseFile(e.target.files?.[0]||null)} className="block max-w-full text-sm file:mr-4 file:border-0 file:bg-ink file:px-5 file:py-3 file:text-white"/><p id="resume-help" className="mt-4 text-xs leading-6 text-ink-mute">{t('fileHelp')}</p>{file&&<p className="mt-3 text-sm">{file.name} · {(file.size/1024/1024).toFixed(2)} MiB</p>}</div>{fileError&&<p id="resume-error" role="alert" className="mt-3 text-sm text-red-700">{fileError}</p>}</div>
          <details className="border-y border-line py-5"><summary className="cursor-pointer text-sm font-semibold">{t('privacy')}</summary><p className="mt-4 whitespace-pre-line text-sm leading-7 text-ink-mute">{locale==='en'?(config.privacyTextEn||t('privacyUnavailable')):config.privacyText}</p></details>
          <label className="flex items-start gap-3 text-sm leading-7"><input type="checkbox" name="privacyAccepted" value="true" required className="mt-1.5 h-4 w-4 accent-brand"/>{t('consent')}</label>
          <button disabled={busy||!config.submissionEnabled||(locale==='en'&&!config.privacyTextEn)} type="submit" className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50">{busy?t('submitting'):t('submit')}</button>
        </form>
        <p className="mt-8 text-sm leading-7 text-ink-mute">{t('contactHelp')} <a href={`mailto:${config.contactEmail}?subject=${encodeURIComponent(`[Xianova 招聘] ${jobId}`)}`} className="text-brand underline">{config.contactEmail}</a></p>
      </div>}
    </div></section>
  </>;
}
