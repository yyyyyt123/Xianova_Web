import {Fragment} from 'react';

/** JD只渲染文本、标题、列表及安全链接，不执行HTML。 */
function inline(line: string) {
  return line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link && /^https?:\/\//i.test(link[2])) return <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer" className="text-brand underline">{link[1]}</a>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}
export function SafeJobText({text}: {text: string}) {
  const lines=text.split(/\r?\n/); const elements=[];
  for(let i=0;i<lines.length;i++) {
    const line=lines[i]; if(!line.trim()) continue;
    if (/^#{1,6}\s/.test(line)) {elements.push(<h3 key={i} className="mb-3 mt-7 text-lg font-semibold">{inline(line.replace(/^#{1,6}\s+/,''))}</h3>);continue;}
    if (/^\s*(?:[-*]|\d+\.)\s/.test(line)) {
      const start=i, list=[]; while(i<lines.length&&/^\s*(?:[-*]|\d+\.)\s/.test(lines[i])) {list.push(<li key={i}>{inline(lines[i].replace(/^\s*(?:[-*]|\d+\.)\s+/,''))}</li>);i++;} i--;
      elements.push(<ul key={start} className="mb-5 list-disc space-y-2 pl-5">{list}</ul>);continue;
    }
    elements.push(<p key={i} className="mb-3 leading-8">{inline(line)}</p>);
  }
  return <div className="text-ink-mute">{elements}</div>;
}
