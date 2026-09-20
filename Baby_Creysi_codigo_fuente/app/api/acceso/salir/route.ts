import { db, invalid, clearSession, sha256, writeOriginAllowed } from '../../auth';
export async function POST(request:Request){
 if(!writeOriginAllowed(request))return invalid('Solicitud inválida.',403);
 const token=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('bc_sesion='))?.slice(10);
 if(token&&/^[0-9a-f]{64}$/.test(token))await db().prepare('DELETE FROM sesiones WHERE token_hash=?').bind(await sha256(token)).run();
 return Response.json({ok:true},{headers:{'Set-Cookie':clearSession(request)}});
}
