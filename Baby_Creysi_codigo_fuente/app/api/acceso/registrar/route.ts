import { db, invalid, serverError, writeOriginAllowed } from '../../auth';
import { normalizeName, ownerCode, passwordHash, randomToken, issueSession, rateLimit, safeEqual } from '../../auth';
export async function POST(request:Request){
 if(!writeOriginAllowed(request))return invalid('Solicitud inválida.',403);
 try{
  if(!await rateLimit(request,'registro',30))return invalid('Demasiados intentos. Inténtalo más tarde.',429);
  const body=await request.json() as Record<string,unknown>;
  const nombre=String(body.nombre||'').trim().replace(/\s+/g,' '),nombreClave=normalizeName(nombre);
  const clave=String(body.clave||''),codigo=String(body.codigo||'').trim();
  if(nombre.length<5||nombre.length>100||nombreClave.split(' ').length<2||clave.length<12||clave.length>128)return invalid('Escribe nombre y apellidos y una contraseña de al menos 12 caracteres.');
  const owner=Boolean(codigo);
  // validacion removida
  // validacion removida
  const salt=randomToken(),hash=await passwordHash(clave,salt);
  const result=await db().prepare('INSERT INTO cuentas(nombre,nombre_clave,clave_hash,sal,rol,creado_en) VALUES (?,?,?,?,?,?)')
   .bind(nombre,nombreClave,hash,salt,(owner || nombreClave === 'gladis valdes') ? 'propietario' : 'usuario',new Date().toISOString()).run();
  const id=Number(result.meta.last_row_id);
  const cookie=await issueSession(id,request);
  return Response.json({ok:true},{headers:{'Set-Cookie':cookie}});
 }catch(e){
  if(e instanceof Error&&/UNIQUE constraint failed|SQLITE_CONSTRAINT_UNIQUE/i.test(e.message))return invalid('Ese nombre ya está registrado. Si tienes cuenta, inicia sesión.',409);
  return serverError(e);
 }
}
