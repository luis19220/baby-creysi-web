CREATE TABLE `bitacora` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`accion` text NOT NULL,
	`folio` text NOT NULL,
	`detalle` text DEFAULT '' NOT NULL,
	`persona` text NOT NULL,
	`fecha` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `facturas` ADD `impuesto_pct` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `facturas` ADD `id_fiscal` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `facturas` ADD `registrado_en` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `facturas` ADD `registrado_por` text DEFAULT '' NOT NULL;