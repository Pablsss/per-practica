import dataset from '../data/exams.json';
import {isCorrect} from './answer';
export type Question={number:number;text:string;options:string[];answer:number|null;unit:string;page:number;images:string[];note?:string;explanation?:string;explanationSource?:string;excluded?:boolean};
export type Exam={id:string;title:string;year:number;source:string;pdf:string;questions:Question[];issues?:string[];complete?:boolean;keyPages:number[]};
export const exams=dataset as Exam[];
export function getExam(id:string){return exams.find(e=>e.id===id);}
export function catalog(){return exams.map(({questions,...e})=>({...e,count:questions.length,gradable:questions.filter(q=>!q.excluded&&q.answer!==null).length}));}
export function score(exam:Exam,answers:(number|null)[]){
 const rows=exam.questions.map((q,i)=>({number:q.number,unit:q.unit,excluded:q.excluded||q.answer===null,correct:isCorrect(q,answers[i]),blank:answers[i]===null}));
 const valid=rows.filter(q=>!q.excluded),correct=valid.filter(q=>q.correct).length;
 const limits=[{name:'Total',max:13,errors:valid.filter(q=>!q.correct).length},...([{name:'Balizamiento',max:2},{name:'RIPA',max:5},{name:'Carta de navegación',max:2}].map(b=>({...b,errors:valid.filter(q=>q.unit===b.name&&!q.correct).length})))];
 return {correct,total:valid.length,errors:valid.length-correct,blank:valid.filter(q=>q.blank).length,excluded:rows.length-valid.length,passed:limits.every(l=>l.errors<=l.max),provisional:!exam.complete,limits};
}
export function publicExam(e:Exam,solutions=false){return {...e,questions:e.questions.map(q=>solutions?q:{number:q.number,text:q.text,options:q.options,unit:q.unit,page:q.page,images:q.images,note:q.note,excluded:q.excluded})};}
