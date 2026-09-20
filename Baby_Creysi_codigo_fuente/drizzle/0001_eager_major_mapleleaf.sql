CREATE TABLE `documentos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tipo` text NOT NULL,
	`titulo` text NOT NULL,
	`referencia` text DEFAULT '' NOT NULL,
	`fecha` text DEFAULT '' NOT NULL,
	`ubicacion` text DEFAULT '' NOT NULL,
	`observaciones` text DEFAULT '' NOT NULL,
	`creado_por` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `usuarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chatgpt_id` text NOT NULL,
	`correo` text NOT NULL,
	`nombre` text NOT NULL,
	`rol` text DEFAULT 'usuario' NOT NULL,
	`creado_en` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_chatgpt_id_unique` ON `usuarios` (`chatgpt_id`);--> statement-breakpoint
ALTER TABLE `facturas` ADD `subtotal` real;--> statement-breakpoint
ALTER TABLE `facturas` ADD `concepto` text DEFAULT '' NOT NULL;