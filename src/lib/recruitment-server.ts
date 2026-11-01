import 'server-only';
import type {Job} from './recruitment';

/** 仅公开岗位列表使用30秒缓存；投递和个人信息接口不经过此方法。 */
export async function getPublishedJobs(): Promise<Job[] | undefined> {
  const origin = process.env.NEXT_PUBLIC_RECRUITMENT_API_ORIGIN?.replace(/\/$/, '');
  if (!origin) return undefined;

  try {
    const response = await fetch(`${origin}/api/xianova/recruitment/jobs?pageSize=100`, {
      next: {revalidate: 30},
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return undefined;
    const result = await response.json();
    if (result.success === false || !Array.isArray(result.data?.records)) return undefined;
    return result.data.records as Job[];
  } catch {
    // 不把短暂的后端/构建网络故障显示成“暂无岗位”，允许浏览器实时重试。
    return undefined;
  }
}
