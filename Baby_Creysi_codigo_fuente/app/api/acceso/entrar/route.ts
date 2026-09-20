import { db, invalid, serverError, writeOriginAllowed, normalizeName, passwordHash, rateLimit, safeEqual, issueSession } from '../../auth';
export async function POST(request:Request){
 if(!writeOriginAllowed(request))return invalid('Solicitud inválida.',403);
 try{
  if(!await rateLimit(request,'ingreso',30))return invalid('Demasiados intentos. Inténtalo más tarde.',429);
  const body=await request.json() as Record<string,unknown>;
  const name=normalizeName(String(body.nombre||'')),password=String(body.clave||'');
  if(name.length>100||password.length>128)return invalid('Datos incorrectos.',401);
  const user=await db().prepare('SELECT id,clave_hash,sal,intentos,bloqueo_hasta FROM cuentas WHERE nombre_clave=?').bind(name).first<{id:number;clave_hash:string;sal:string;intentos:number;bloqueo_hasta:number}>();
  if(user?.bloqueo_hasta&&user.bloqueo_hasta>Date.now())return invalid('Cuenta bloqueada unos minutos por varios intentos. Inténtalo más tarde.',429);
  const computed=await passwordHash(password,user?.sal||'dummy-salt-value');
  if(!user||!safeEqual(computed,user.clave_hash)){
   if(user)await db().prepare('UPDATE cuentas SET intentos=?,bloqueo_hasta=? WHERE id=?').bind(user.intentos+1,user.intentos+1>=6?Date.now()+15*60000:0,user.id).run();
   return invalid('Nombre o contraseña incorrectos.',401);
  }
  await db().prepare('UPDATE cuentas SET intentos=0,bloqueo_hasta=0 WHERE id=?').bind(user.id).run();
  const cookie=await issueSession(user.id,request);
  return Response.json({ok:true},{headers:{'Set-Cookie':cookie}});
 }catch(e){return serverError(e)}
}
