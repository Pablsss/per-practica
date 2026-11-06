import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
const root=process.cwd(),cache=new Map(),sqlite=new DatabaseSync(':memory:');
sqlite.exec(fs.readFileSync('drizzle/0000_mature_mastermind.sql','utf8'));
const DB={prepare(sql){return{bind(...params){const statement=sqlite.prepare(sql);return{async first(){return statement.get(...params)||null;},async all(){return{results:statement.all(...params)};},async run(){return statement.run(...params);}};}};}};
function load(file){
 file=path.resolve(root,file);if(cache.has(file))return cache.get(file).exports;
 if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 const module={exports:{}};cache.set(file,module);
 const source=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const require=(name)=>{if(name==='cloudflare:workers')return{env:{DB}};let p=path.resolve(path.dirname(file),name);if(!path.extname(p))p+='.ts';return load(p);};
 vm.runInNewContext(source,{module,exports:module.exports,require,console,Response,Request,URL,process:{env:{NODE_ENV:'production'}}},{filename:file});return module.exports;
}
const {exams,score,publicExam}=load('lib/exams.ts');
const e=exams[0],a=e.questions.map(q=>q.answer);
assert.equal(a.length,4);
assert.equal(score(e,a).correct,a.length);
assert.equal(score(e,a.map(()=>null)).correct,0);
assert.ok(publicExam(e).questions.every(q=>!('answer' in q)));
const {GET,POST}=load('app/api/attempts/route.ts');
const url='https://test.invalid/api/attempts';
async function post(body,user='owner'){return POST(new Request(url,{method:'POST',headers:{'content-type':'application/json',origin:'https://test.invalid',...(user?{'oai-authenticated-user-id':user}:{})},body:JSON.stringify(body)}));}
async function get(id,user='owner'){return GET(new Request(url+(id?'?id='+id:''),{headers:user?{'oai-authenticated-user-id':user}:{}}));}
const id='00000000-0000-4000-8000-000000000001';
assert.equal((await get(null,null)).status,401);
assert.equal((await post({action:'start',id,examId:e.id})).status,200);
assert.equal((await get(id,'other')).status,404);
assert.equal((await post({action:'answer',id,index:0,value:9})).status,400);
assert.equal((await post({action:'answer',id,index:0,value:a[0],duration:12})).status,200);
let read=await(await get(id)).json();assert.equal(read.attempt.answers[0],a[0]);assert.ok(!('answer'in read.exam.questions[0]));
assert.equal((await post({action:'sync',id,answers:a,duration:25})).status,200);
assert.equal((await post({action:'finish',id,answers:a,duration:40})).status,200);
assert.equal((await post({action:'finish',id,answers:a,duration:41})).status,200);
read=await(await get(id)).json();assert.equal(read.result.correct,a.length);assert.equal(read.result.passed,true);assert.equal(read.attempt.duration,40);assert.ok('answer'in read.exam.questions[0]);
assert.equal((await post({action:'answer',id,index:0,value:null})).status,409);
assert.equal((await(await get(null,'other')).json()).length,0);
assert.equal((await(await get()).json()).length,1);
console.log('Verified grading, resume, finish, ownership and immutable history.');
