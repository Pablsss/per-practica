import {env} from 'cloudflare:workers';
export function database(){if(!env.DB)throw new Error('Historial no disponible');return env.DB;}
export function identity(req:Request){return req.headers.get('oai-authenticated-user-id') || (process.env.NODE_ENV==='development'?'preview-user':null);}
