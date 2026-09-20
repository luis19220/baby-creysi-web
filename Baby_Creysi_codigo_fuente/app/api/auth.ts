import { env } from "cloudflare:workers";

const cookieName = "bc_sesion";
const days = 7;
export function db() { if (!env.DB) throw new Error("Base de datos no disponible"); return env.DB; }
export type Account = { id:number; nombre:string; rol:string };
export function writeOriginAllowed(request: Request) {
 const origin=request.headers.get('origin');
 if(!origin)return false;
 try{return new URL(origin).origin===new URL(request.url).origin}catch{return false}
}
export function ownerCode(){return (env as unknown as {OWNER_SETUP_CODE?:string}).OWNER_SETUP_CODE||""}
export function normalizeName(name:string){return name.trim().replace(/\s+/g,' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
export function hex(buffer:ArrayBuffer|Uint8Array){return Array.from(new Uint8Array(buffer)).map(x=>x.toString(16).padStart(2,'0')).join('')}
export async function sha256(s:string){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))}
export async function passwordHash(password:string,salt:string){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256));
}
export function safeEqual(a:string,b:string){const aa=new TextEncoder().encode(a),bb=new TextEncoder().encode(b);let diff=aa.length^bb.length;for(let i=0;i<Math.max(aa.length,bb.length);i++)diff|=(aa[i]||0)^(bb[i]||0);return diff===0}
export function randomToken(){return hex(crypto.getRandomValues(new Uint8Array(32)))}
export async function accountFromCookie(header:string|null):Promise<Account|null>{
 const token=header?.split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);
 if(!token||!/^[0-9a-f]{64}$/.test(token))return null;
 return (await db().prepare('SELECT c.id,c.nombre,c.rol FROM sesiones s JOIN cuentas c ON c.id=s.cuenta_id WHERE s.token_hash=? AND s.vence_en>?').bind(await sha256(token),Date.now()).first<Account>())||null;
}
export async function account(request:Request){return accountFromCookie(request.headers.get('cookie'))}
export async function issueSession(accountId:number,request:Request){
 const token=randomToken();const hash=await sha256(token);const expires=Date.now()+days*86400000;
 await db().prepare('INSERT INTO sesiones(token_hash,cuenta_id,vence_en) VALUES (?,?,?)').bind(hash,accountId,expires).run();
 const secure=new URL(request.url).protocol==='https:'?'; Secure':'';
 return `${cookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${days*86400}${secure}`;
}
export function clearSession(request:Request){const secure=new URL(request.url).protocol==='https:'?'; Secure':'';return `${cookieName}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`}
export function denied(){return Response.json({error:'Inicia sesión para continuar.'},{status:401})}
export function invalid(error:string,status=400){return Response.json({error},{status})}
export function serverError(e:unknown){console.error(e);return invalid('No se pudo completar la operación. Inténtalo de nuevo.',500)}
export async function rateLimit(request:Request,kind:string,limit:number){
 const ip=request.headers.get('cf-connecting-ip')||'unknown';const key=await sha256(kind+':'+ip);
 const now=Date.now();const previous=await db().prepare('SELECT cantidad,ventana_inicio FROM intentos_acceso WHERE clave=?').bind(key).first<{cantidad:number;ventana_inicio:number}>();
 if(previous&&now-previous.ventana_inicio<600000&&previous.cantidad>=limit)return false;
 await db().prepare('INSERT INTO intentos_acceso(clave,cantidad,ventana_inicio) VALUES (?,1,?) ON CONFLICT(clave) DO UPDATE SET cantidad=CASE WHEN ?-ventana_inicio<600000 THEN cantidad+1 ELSE 1 END,ventana_inicio=CASE WHEN ?-ventana_inicio<600000 THEN ventana_inicio ELSE ? END').bind(key,now,now,now,now).run();
 return true;
}
