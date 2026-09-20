import { authorized, db, denied, serverError } from '../_lib';
import { invoiceWorkbook } from '../../../lib/excel';
export async function GET(request:Request){
 if(!await authorized(request))return denied();
 try{
  const [invoices,history]=await Promise.all([
   db().prepare("SELECT f.folio,f.fecha_emision AS fechaEmision,p.nombre AS proveedor,CASE WHEN p.rfc LIKE 'SIN-RFC-%' THEN '' ELSE p.rfc END AS rfc,f.id_fiscal AS idFiscal,f.concepto,f.subtotal,f.impuesto_pct AS impuestoPct,f.importe AS total,f.estado,f.registrado_en AS registradoEn,f.registrado_por AS registradoPor,f.observaciones FROM facturas f JOIN proveedores p ON p.id=f.proveedor_id ORDER BY f.fecha_emision DESC,f.id DESC").all(),
   db().prepare('SELECT fecha,accion,folio,detalle,persona FROM bitacora ORDER BY id DESC').all(),
  ]);
  const bytes=invoiceWorkbook(invoices.results as Record<string,unknown>[],history.results as Record<string,unknown>[]);
  const filename=`registro_facturas_${new Date().toISOString().slice(0,10)}.xlsx`;
  return new Response(bytes as BodyInit,{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`attachment; filename="${filename}"`,'Cache-Control':'no-store'}});
 }catch(e){return serverError(e)}
}
