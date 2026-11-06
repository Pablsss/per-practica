// Some original papers print the same correct answer twice. Accept either copy.
export function isCorrect(q:{answer:number|null;options:string[]},value:number|null){
  if(value===null||q.answer===null)return false;
  return value===q.answer||q.options[value]?.trim()===q.options[q.answer]?.trim();
}
