import { account, db, invalid, serverError, writeOriginAllowed } from '../../../_lib';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 const user=await account(request);if(!user||!writeOriginAllowed(request))return invalid('Acceso denegado.',401);
 const id=Number((await params).id);if(!Number.isSafeInteger(id)||id<1)return invalid('Factura inválida.');
 try{
  const old=await db().prepare('SELECT folio,estado FROM facturas WHERE id=?').bind(id).first<{folio:string;estado:string}>();
  if(!old)return invalid('Factura no encontrada.',404);
  if(old.estado==='Pagada')return Response.json({ok:true});
  await db().prepare("UPDATE facturas SET estado='Pagada' WHERE id=?").bind(id).run();
  await db().prepare('INSERT INTO bitacora(accion,folio,detalle,persona,fecha) VALUES (?,?,?,?,?)').bind('Pago',old.folio,'Marcada como pagada',user.nombre,new Date().toISOString()).run();
  return Response.json({ok:true});
 }catch(e){return serverError(e)}
}
