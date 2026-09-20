import { db, invalid, serverError, writeAllowed } from "../_lib";
export async function POST(request: Request) {
  if (!await writeAllowed(request)) return invalid("Acceso denegado.", 403);
  try {
    const body = await request.json() as Record<string, unknown>;
    const nombre = String(body.nombre ?? "").trim();
    const rfc = String(body.rfc ?? "").trim().toUpperCase();
    if (!nombre || nombre.length > 150 || !rfc || rfc.length > 20) return invalid("Completa el nombre y RFC.");
    await db().prepare("INSERT INTO proveedores(nombre,rfc) VALUES (?,?)").bind(nombre,rfc).run();
    return Response.json({ ok: true });
  } catch (error) { return serverError(error); }
}
