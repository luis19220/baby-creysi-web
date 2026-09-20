import { account, db, denied, invalid, serverError, writeOriginAllowed } from './auth';
export { account, db, denied, invalid, serverError, writeOriginAllowed };
export async function authorized(request:Request){return Boolean(await account(request))}
export async function registered(request:Request){return account(request)}
export async function writeAllowed(request:Request){return writeOriginAllowed(request)&&await authorized(request)}
export function validInvoice(body: Record<string, unknown>) {
  const folio = String(body.folio ?? "").trim();
  const proveedorNombre = String(body.proveedorNombre ?? "").trim().replace(/\s+/g,' ');
  const fechaEmision = String(body.fechaEmision ?? "");
  const fechaVencimiento = String(body.fechaVencimiento ?? "");
  const subtotal = Number(body.subtotal);
  const concepto = String(body.concepto ?? "").trim();
  const impuestoPct = Number(body.impuestoPct ?? 0);
  const idFiscal = String(body.idFiscal ?? "").trim();
  const estado = String(body.estado ?? "");
  const observaciones = String(body.observaciones ?? "").trim();
  const date = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
  if (!folio || folio.length > 80 || !proveedorNombre || proveedorNombre.length > 150 || !date(fechaEmision) || (fechaVencimiento && !date(fechaVencimiento)) || !Number.isFinite(subtotal) || subtotal < 0 || !Number.isFinite(impuestoPct) || impuestoPct < 0 || impuestoPct > 100 || idFiscal.length>100 || !concepto || concepto.length>300 || !["Pendiente", "Pagada", "Cancelada"].includes(estado) || observaciones.length > 1000)
    throw new Error("Revisa los campos de la factura.");
  return { folio, proveedorNombre, fechaEmision, fechaVencimiento: fechaVencimiento || null, subtotal: Math.round(subtotal * 100) / 100, impuestoPct, idFiscal, concepto, estado, observaciones };
}
export async function resolveProvider(nombre:string){
 const found=await db().prepare('SELECT id FROM proveedores WHERE nombre=? COLLATE NOCASE LIMIT 1').bind(nombre).first<{id:number}>();
 if(found)return found.id;
 const code='SIN-RFC-'+crypto.randomUUID().slice(0,18).toUpperCase();
 const result=await db().prepare('INSERT INTO proveedores(nombre,rfc) VALUES (?,?)').bind(nombre,code).run();
 return Number(result.meta.last_row_id);
}
