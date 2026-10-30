import {CareersPage} from '@/components/recruitment/CareersPage';
export default function Page({params}:{params:{jobId:string}}){return <CareersPage jobId={params.jobId}/>;}
