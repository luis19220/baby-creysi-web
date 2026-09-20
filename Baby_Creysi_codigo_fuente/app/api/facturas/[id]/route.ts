import { account, db, invalid, resolveProvider, serverError, validInvoice, writeOriginAllowed } from '../../_lib';
type Context={params:Promise<{id:string}>};
export async function PUT(request:Request,{params}:Context){
 const user=await account(request);if(!user||!writeOriginAllowed(request))return invalid('Acceso denegado.',401);
 const id=Number((await params).id);if(!Number.isSafeInteger(id)||id<1)return invalid('Factura inválida.');
 try{
  const old=await db().prepare('SELECT folio,estado FROM facturas WHERE id=?').bind(id).first<{folio:string;estado:string}>();if(!old)return invalid('Factura no encontrada.',404);
  const f=validInvoice(await request.json() as Record<string,unknown>);
  const proveedorId=await resolveProvider(f.proveedorNombre);
  const total=Math.round(f.subtotal*(1+f.impuestoPct/100)*100)/100;
  await db().prepare('UPDATE facturas SET folio=?,proveedor_id=?,fecha_emision=?,fecha_vencimiento=?,importe=?,subtotal=?,concepto=?,impuesto_pct=?,id_fiscal=?,estado=?,observaciones=? WHERE id=?')
   .bind(f.folio,proveedorId,f.fechaEmision,f.fechaVencimiento,total,f.subtotal,f.concepto,f.impuestoPct,f.idFiscal,f.estado,f.observaciones,id).run();
  await db().prepare('INSERT INTO bitacora(accion,folio,detalle,persona,fecha) VALUES (?,?,?,?,?)')
   .bind(old.estado!==f.estado?'Cambio de estado':'Edición',f.folio,old.estado!==f.estado?`${old.estado} → ${f.estado}`:'Datos actualizados',user.nombre,new Date().toISOString()).run();
  return Response.json({ok:true});
 }catch(e){if(e instanceof Error&&e.message.startsWith('Revisa'))return invalid(e.message);if(e instanceof Error&&/UNIQUE constraint failed/i.test(e.message))return invalid('Ese número de factura ya existe para el proveedor.',409);return serverError(e)}
}
export async function DELETE(request:Request,{params}:Context){
 const user=await account(request);if(!user||!writeOriginAllowed(request))return invalid('Acceso denegado.',401);
 const id=Number((await params).id);if(!Number.isSafeInteger(id)||id<1)return invalid('Factura inválida.');
 try{
  const old=await db().prepare('SELECT folio FROM facturas WHERE id=?').bind(id).first<{folio:string}>();if(!old)return invalid('Factura no encontrada.',404);
  await db().prepare('DELETE FROM facturas WHERE id=?').bind(id).run();
  await db().prepare('INSERT INTO bitacora(accion,folio,detalle,persona,fecha) VALUES (?,?,?,?,?)').bind('Eliminación',old.folio,'Factura eliminada',user.nombre,new Date().toISOString()).run();
  return Response.json({ok:true});
 }catch(e){return serverError(e)}
}
