import {CareersPage} from '@/components/recruitment/CareersPage';
import {getPublishedJobs} from '@/lib/recruitment-server';
export const metadata={title:'加入我们 | Careers | Xianova'};
export const revalidate=30;
export default async function Page(){
  const initialJobs=await getPublishedJobs();
  return <CareersPage initialJobs={initialJobs} initialJobsAt={Date.now()}/>;
}
