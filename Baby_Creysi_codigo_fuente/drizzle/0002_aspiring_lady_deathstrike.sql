CREATE TABLE `cuentas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`nombre_clave` text NOT NULL,
	`clave_hash` text NOT NULL,
	`sal` text NOT NULL,
	`rol` text DEFAULT 'usuario' NOT NULL,
	`creado_en` text NOT NULL,
	`intentos` integer DEFAULT 0 NOT NULL,
	`bloqueo_hasta` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cuentas_nombre_clave_unique` ON `cuentas` (`nombre_clave`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_cuentas_propietario_unico` ON `cuentas` (`rol`) WHERE "cuentas"."rol" = 'propietario';--> statement-breakpoint
CREATE TABLE `sesiones` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`cuenta_id` integer NOT NULL,
	`vence_en` integer NOT NULL,
	FOREIGN KEY (`cuenta_id`) REFERENCES `cuentas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_sesiones_cuenta` ON `sesiones` (`cuenta_id`);