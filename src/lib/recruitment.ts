export const RECRUITMENT_ORIGIN = process.env.NEXT_PUBLIC_RECRUITMENT_API_ORIGIN?.replace(/\/$/, '') || '';
export type Job = {jobId: string; revision: number; title: {zh: string; en?: string}; location: {zh: string; en?: string}; responsibilities: {zh: string; en?: string}; requirements: {zh: string; en?: string}; department?: string; departmentEn?: string; category?: string; employmentType: string};
export type FormConfig = {maxFileBytes: number; privacyVersion: string; privacyText: string; privacyTextEn: string; contactEmail: string; submissionEnabled: boolean; environment: string};
export type Receipt = {applicationId: string; emailStatus: string; retryAllowed: boolean; tokenExpiresAt: string; retryAfterAt?: string};
export class RecruitmentError extends Error { constructor(public status: number, public code: string, message: string) {super(message);} }
export async function recruitmentApi<T>(path: string, init?: RequestInit): Promise<T> {
  if (!RECRUITMENT_ORIGIN) throw new RecruitmentError(503, 'NOT_CONFIGURED', 'Recruitment service is not configured');
  const response = await fetch(`${RECRUITMENT_ORIGIN}/api/xianova/recruitment${path}`, {...init, credentials: 'omit', cache: 'no-store', signal: init?.signal || AbortSignal.timeout(120000)});
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) throw new RecruitmentError(response.status, result.code || 'REQUEST_FAILED', result.message || 'Request failed');
  return result.data as T;
}
export function jobText(value: {zh: string; en?: string}, locale: string) {return locale === 'en' && value.en?.trim() ? value.en.trim() : value.zh;}
export function hasJobTranslationFallback(job:Job,locale:string) {
  return locale==='en'&&([job.title,job.location,job.responsibilities,job.requirements].some(value=>!value.en?.trim())||Boolean(job.department?.trim()&&!job.departmentEn?.trim()));
}
