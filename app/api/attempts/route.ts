import {database,identity} from '../../../lib/exam-db';
import {getExam,score,publicExam} from '../../../lib/exams';
const reply=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(req:Request){
 const user=identity(req);if(!user)return reply({error:'Inicia sesión con tu cuenta de ChatGPT para acceder a tu historial.'},401);
 try{const db=database(),id=new URL(req.url).searchParams.get('id');
 if(id){const a=await db.prepare('SELECT * FROM attempts WHERE id=? AND user_id=?').bind(id,user).first<any>();if(!a)return reply({error:'Intento no encontrado'},404);const e=getExam(a.exam_id);if(!e)return reply({error:'Examen no encontrado'},404);const answers=JSON.parse(a.answers);return reply({attempt:{...a,answers},exam:publicExam(e,a.status==='finished'),result:a.status==='finished'?score(e,answers):null});}
 const {results}=await db.prepare('SELECT id,exam_id,started_at,finished_at,duration,status,correct,passed,answers FROM attempts WHERE user_id=? ORDER BY started_at DESC LIMIT 500').bind(user).all<any>();return reply(results.map(a=>{const e=getExam(a.exam_id);return {...a,answers:undefined,answered:JSON.parse(a.answers).filter((x:unknown)=>x!==null).length,title:e?.title,total:e?.questions.filter(q=>!q.excluded).length,provisional:!e?.complete};}));
 }catch(e){console.error('history',e);return reply({error:'No se ha podido cargar el historial. Inténtalo de nuevo.'},503);}
}
export async function POST(req:Request){
 const user=identity(req);if(!user)return reply({error:'Inicia sesión con tu cuenta de ChatGPT para guardar tus exámenes.'},401);
 const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return reply({error:'Solicitud no válida'},403);
 try{const db=database(),body=await req.json() as any;
 if(body.action==='start'){
 const e=getExam(String(body.examId));if(!e)return reply({error:'Examen no encontrado'},404);if(typeof body.id!=='string'||! /^[a-z0-9-]{36}$/i.test(body.id))return reply({error:'Identificador no válido'},400);
 await db.prepare('INSERT OR IGNORE INTO attempts (id,user_id,exam_id,answers,started_at,duration,status) VALUES (?,?,?,?,?,0,?)').bind(body.id,user,e.id,JSON.stringify(e.questions.map(()=>null)),new Date().toISOString(),'in_progress').run();return reply({id:body.id});}
 const a=await db.prepare('SELECT * FROM attempts WHERE id=? AND user_id=?').bind(body.id,user).first<any>();if(!a)return reply({error:'Intento no encontrado'},404);const e=getExam(a.exam_id)!;
 if(a.status==='finished')return body.action==='finish'?reply({id:a.id}):reply({error:'Este examen ya está terminado'},409);
 const duration=Number.isFinite(body.duration)?Math.max(a.duration,Math.min(Math.round(body.duration),604800)):a.duration;
 if(body.action==='answer'){
 if(!Number.isInteger(body.index)||body.index<0||body.index>=e.questions.length||![null,0,1,2,3].includes(body.value))return reply({error:'Respuesta no válida'},400);
 await db.prepare("UPDATE attempts SET answers=json_set(answers,?,json(?)),duration=max(duration,?) WHERE id=? AND user_id=? AND status='in_progress'").bind(`$[${body.index}]`,JSON.stringify(body.value),duration,a.id,user).run();return reply({saved:true});}
 if(body.action==='finish'||body.action==='sync'){
 if(!Array.isArray(body.answers)||body.answers.length!==e.questions.length||!body.answers.every((v:unknown)=>v===null||(typeof v==='number'&&[0,1,2,3].includes(v))))return reply({error:'Respuestas no válidas'},400);
 if(body.action==='sync'){await db.prepare("UPDATE attempts SET answers=?,duration=max(duration,?) WHERE id=? AND user_id=? AND status='in_progress'").bind(JSON.stringify(body.answers),duration,a.id,user).run();return reply({saved:true});}
 const r=score(e,body.answers);await db.prepare("UPDATE attempts SET answers=?,duration=?,finished_at=?,status='finished',correct=?,passed=? WHERE id=? AND user_id=? AND status='in_progress'").bind(JSON.stringify(body.answers),duration,new Date().toISOString(),r.correct,r.passed?1:0,a.id,user).run();return reply({id:a.id});}
 return reply({error:'Acción no válida'},400);
 }catch(e){console.error('save attempt',e);return reply({error:'No se ha podido guardar. Tus respuestas siguen en pantalla; vuelve a intentarlo.'},503);}
}
