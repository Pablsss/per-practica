import {catalog,getExam,publicExam} from '../../../lib/exams';
export async function GET(req:Request){const id=new URL(req.url).searchParams.get('id');if(id){const e=getExam(id);return e?Response.json(publicExam(e)):Response.json({error:'Examen no encontrado'},{status:404});}return Response.json(catalog());}
