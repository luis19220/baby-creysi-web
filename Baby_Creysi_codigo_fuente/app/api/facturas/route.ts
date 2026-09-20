import { account, db, invalid, resolveProvider, serverError, validInvoice, writeOriginAllowed } from '../_lib';
export async function POST(request: Request) {
 const user=await account(request); if(!user||!writeOriginAllowed(request))return invalid('Inicia sesión para registrar.',401);
 try{
  const f=validInvoice(await request.json() as Record<string,unknown>);
  const proveedorId=await resolveProvider(f.proveedorNombre);
  const total=Math.round(f.subtotal*(1+f.impuestoPct/100)*100)/100;
  await db().prepare('INSERT INTO facturas(folio,proveedor_id,fecha_emision,fecha_vencimiento,importe,subtotal,concepto,impuesto_pct,id_fiscal,registrado_en,registrado_por,estado,observaciones) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(f.folio,proveedorId,f.fechaEmision,f.fechaVencimiento,total,f.subtotal,f.concepto,f.impuestoPct,f.idFiscal,new Date().toISOString(),user.nombre,f.estado,f.observaciones).run();
  await db().prepare('INSERT INTO bitacora(accion,folio,detalle,persona,fecha) VALUES (?,?,?,?,?)').bind('Registro',f.folio,'Factura registrada',user.nombre,new Date().toISOString()).run();
  return Response.json({ok:true});
 }catch(e){if(e instanceof Error&&e.message.startsWith('Revisa'))return invalid(e.message);if(e instanceof Error&&/UNIQUE constraint failed/i.test(e.message))return invalid('Ese número de factura ya existe para el proveedor.',409);return serverError(e)}
}
