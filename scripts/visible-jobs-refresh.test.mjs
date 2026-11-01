import {test} from 'node:test';
import assert from 'node:assert/strict';
import {startVisibleJobsRefresh} from '../src/lib/visible-jobs-refresh.mjs';

const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
function fixture(refresh,age=0){
  let time=100000,id=0;const timers=new Map();
  const doc=Object.assign(new EventTarget(),{visibilityState:'visible'}),win=new EventTarget();
  const manager=startVisibleJobsRefresh({refresh,lastCheckedAt:time-age,documentTarget:doc,windowTarget:win,now:()=>time,
    setTimer:(callback,delay)=>{const key=++id;timers.set(key,{callback,at:time+delay});return key;},clearTimer:key=>timers.delete(key)});
  return {manager,doc,win,timers,async tick(ms){const target=time+ms;let count=0;
    while(true){const next=[...timers].filter(([,t])=>t.at<=target).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;
      if(++count>100)throw new Error('Timer loop');time=next[1].at;timers.delete(next[0]);next[1].callback();await flush();}
    time=target;await flush();}};
}

test('fresh initial list waits 30 seconds; focus does not add requests',async()=>{
  let calls=0;const f=fixture(async()=>{calls++;});
  f.win.dispatchEvent(new Event('focus'));await f.tick(29999);assert.equal(calls,0);
  await f.tick(1);assert.equal(calls,1);f.win.dispatchEvent(new Event('focus'));await flush();assert.equal(calls,1);
  await f.tick(30000);assert.equal(calls,2);f.manager.dispose();
});
test('hidden pages pause polling; returning triggers one overdue request',async()=>{
  let calls=0;const f=fixture(async()=>{calls++;});
  f.doc.visibilityState='hidden';f.doc.dispatchEvent(new Event('visibilitychange'));
  await f.tick(90000);f.win.dispatchEvent(new Event('focus'));assert.equal(calls,0);assert.equal(f.timers.size,0);
  f.doc.visibilityState='visible';f.doc.dispatchEvent(new Event('visibilitychange'));f.win.dispatchEvent(new Event('focus'));
  await flush();assert.equal(calls,1);f.manager.dispose();
});
test('expired prefetched list refreshes immediately and concurrent retry is coalesced',async()=>{
  let calls=0,resolve;const f=fixture(()=>{calls++;return new Promise(r=>{resolve=r;});},30001);
  assert.equal(calls,1);void f.manager.check(true);f.win.dispatchEvent(new Event('focus'));assert.equal(calls,1);
  resolve();await flush();assert.equal(f.timers.size,1);f.manager.dispose();
});
test('manual retry and network recovery can refresh before the next interval',async()=>{
  let calls=0;const f=fixture(async()=>{calls++;});
  await f.manager.check(true);assert.equal(calls,1);
  f.win.dispatchEvent(new Event('online'));await flush();assert.equal(calls,2);f.manager.dispose();
});
test('a failed request does not stop later scheduled retries',async()=>{
  let calls=0;const f=fixture(async()=>{calls++;if(calls===1)throw new Error('offline');},30001);
  await flush();assert.equal(calls,1);await f.tick(30000);assert.equal(calls,2);f.manager.dispose();
});
test('dispose clears timers/listeners and completion cannot restart polling',async()=>{
  let calls=0,resolve;const f=fixture(()=>{calls++;return new Promise(r=>{resolve=r;});},30001);
  f.manager.dispose();resolve();await flush();f.win.dispatchEvent(new Event('online'));f.win.dispatchEvent(new Event('focus'));
  await f.tick(90000);assert.equal(calls,1);assert.equal(f.timers.size,0);
});
