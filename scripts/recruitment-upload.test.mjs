import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateResume} from '../src/lib/recruitment-upload.mjs';
test('在网络请求前拒绝超限文件，允许恰好10MiB',()=>{
  assert.equal(validateResume({name:'cv.pdf',size:10485760}),null);
  assert.equal(validateResume({name:'cv.pdf',size:10485761}),'large');
  assert.equal(validateResume({name:'cv.pdf',size:5*1024*1024*1024}),'large');
});
test('文件必选、非空且格式受限，远端配置只能收紧上限',()=>{
  assert.equal(validateResume(null),'required');
  assert.equal(validateResume({name:'cv.docx',size:0}),'empty');
  assert.equal(validateResume({name:'cv.exe',size:200}),'type');
  assert.equal(validateResume({name:'CV.DOCX',size:200}),null);
  assert.equal(validateResume({name:'cv.pdf',size:10485761},99999999),'large');
  assert.equal(validateResume({name:'cv.pdf',size:200},100),'large');
});
