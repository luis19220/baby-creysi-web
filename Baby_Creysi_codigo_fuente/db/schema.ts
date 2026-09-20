import { integer, real, sqliteTable, text, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const proveedores = sqliteTable("proveedores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  rfc: text("rfc").notNull(),
}, (t) => [uniqueIndex("idx_proveedores_rfc").on(t.rfc)]);

export const facturas = sqliteTable("facturas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  folio: text("folio").notNull(),
  proveedorId: integer("proveedor_id").notNull().references(() => proveedores.id),
  fechaEmision: text("fecha_emision").notNull(),
  fechaVencimiento: text("fecha_vencimiento"),
  importe: real("importe").notNull(),
  subtotal: real("subtotal"),
  concepto: text("concepto").notNull().default(""),
  impuestoPct: real("impuesto_pct").notNull().default(0),
  idFiscal: text("id_fiscal").notNull().default(""),
  registradoEn: text("registrado_en").notNull().default(""),
  registradoPor: text("registrado_por").notNull().default(""),
  estado: text("estado").notNull(),
  observaciones: text("observaciones").notNull().default(""),
}, (t) => [uniqueIndex("idx_facturas_proveedor_folio").on(t.proveedorId, t.folio), index("idx_facturas_estado").on(t.estado)]);

export const usuarios = sqliteTable("usuarios", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chatgptId: text("chatgpt_id").notNull().unique(),
  correo: text("correo").notNull(),
  nombre: text("nombre").notNull(),
  rol: text("rol").notNull().default("usuario"),
  creadoEn: text("creado_en").notNull().default(""),
});

export const documentos = sqliteTable("documentos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tipo: text("tipo").notNull(),
  titulo: text("titulo").notNull(),
  referencia: text("referencia").notNull().default(""),
  fecha: text("fecha").notNull().default(""),
  ubicacion: text("ubicacion").notNull().default(""),
  observaciones: text("observaciones").notNull().default(""),
  creadoPor: text("creado_por").notNull(),
});

export const cuentas = sqliteTable("cuentas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  nombreClave: text("nombre_clave").notNull().unique(),
  claveHash: text("clave_hash").notNull(),
  sal: text("sal").notNull(),
  rol: text("rol").notNull().default("usuario"),
  creadoEn: text("creado_en").notNull(),
  intentos: integer("intentos").notNull().default(0),
  bloqueoHasta: integer("bloqueo_hasta").notNull().default(0),
}, (t) => [uniqueIndex("idx_cuentas_propietario_unico").on(t.rol).where(sql`${t.rol} = 'propietario'`)]);

export const sesiones = sqliteTable("sesiones", {
  tokenHash: text("token_hash").primaryKey(),
  cuentaId: integer("cuenta_id").notNull().references(() => cuentas.id),
  venceEn: integer("vence_en").notNull(),
}, (t) => [index("idx_sesiones_cuenta").on(t.cuentaId)]);

export const intentosAcceso = sqliteTable("intentos_acceso", {
  clave: text("clave").primaryKey(),
  cantidad: integer("cantidad").notNull(),
  ventanaInicio: integer("ventana_inicio").notNull(),
});

export const bitacora = sqliteTable("bitacora", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  accion: text("accion").notNull(),
  folio: text("folio").notNull(),
  detalle: text("detalle").notNull().default(""),
  persona: text("persona").notNull(),
  fecha: text("fecha").notNull(),
});
