import type {Metadata} from 'next';
import {ApplicationSuccess} from '@/components/recruitment/ApplicationSuccess';

export const metadata: Metadata = {robots: {index: false, follow: false}};

export default function Page() {
  return <ApplicationSuccess/>;
}
