import { authorized, db, denied, serverError } from '../_lib';
export async function GET(request:Request){
 if(!await authorized(request))return denied();
 try{
  const [providers,invoices,documents,history]=await Promise.all([
   db().prepare('SELECT id,nombre,rfc FROM proveedores ORDER BY nombre').all(),
   db().prepare('SELECT f.id,f.folio,f.proveedor_id AS proveedorId,p.nombre AS proveedor,p.rfc,f.fecha_emision AS fechaEmision,f.fecha_vencimiento AS fechaVencimiento,f.subtotal,f.concepto,f.impuesto_pct AS impuestoPct,f.id_fiscal AS idFiscal,f.importe AS total,f.registrado_en AS registradoEn,f.registrado_por AS registradoPor,f.estado,f.observaciones FROM facturas f JOIN proveedores p ON p.id=f.proveedor_id ORDER BY f.id DESC').all(),
   db().prepare('SELECT id,tipo,titulo,referencia,fecha,ubicacion,observaciones FROM documentos ORDER BY id DESC').all(),
   db().prepare('SELECT id,accion,folio,detalle,persona,fecha FROM bitacora ORDER BY id DESC LIMIT 500').all(),
  ]);
  return Response.json({proveedores:providers.results,facturas:invoices.results,documentos:documents.results,bitacora:history.results});
 }catch(e){return serverError(e)}
}
