import { db, invalid, serverError, registered, writeOriginAllowed } from "../_lib";
export async function POST(request: Request){
 if(!writeOriginAllowed(request))return invalid('Solicitud inválida.',403);
 const user=await registered(request);if(!user||user.rol!=='propietario')return invalid('Solo la persona propietaria puede agregar documentos.',403);
 try{const b=await request.json() as Record<string,unknown>;
 const tipo=String(b.tipo||'').trim(),titulo=String(b.titulo||'').trim(),referencia=String(b.referencia||'').trim(),fecha=String(b.fecha||'').trim(),ubicacion=String(b.ubicacion||'').trim(),observaciones=String(b.observaciones||'').trim();
 if(!tipo||tipo.length>60||!titulo||titulo.length>180||referencia.length>100||ubicacion.length>180||observaciones.length>1000||(fecha&&!/^\d{4}-\d{2}-\d{2}$/.test(fecha)))return invalid('Revisa los datos del documento.');
 await db().prepare('INSERT INTO documentos(tipo,titulo,referencia,fecha,ubicacion,observaciones,creado_por) VALUES (?,?,?,?,?,?,?)').bind(tipo,titulo,referencia,fecha,ubicacion,observaciones,user.id).run();return Response.json({ok:true});
 }catch(e){return serverError(e)}
}
