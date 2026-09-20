CREATE TABLE `facturas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`folio` text NOT NULL,
	`proveedor_id` integer NOT NULL,
	`fecha_emision` text NOT NULL,
	`fecha_vencimiento` text,
	`importe` real NOT NULL,
	`estado` text NOT NULL,
	`observaciones` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_facturas_proveedor_folio` ON `facturas` (`proveedor_id`,`folio`);--> statement-breakpoint
CREATE INDEX `idx_facturas_estado` ON `facturas` (`estado`);--> statement-breakpoint
CREATE TABLE `proveedores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`rfc` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_proveedores_rfc` ON `proveedores` (`rfc`);