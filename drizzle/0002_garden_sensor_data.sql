CREATE TABLE `sensor_readings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`device_id` text NOT NULL,
	`temperature` real NOT NULL,
	`humidity` real NOT NULL,
	`battery_voltage` real,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_sensor_readings_device_time` ON `sensor_readings` (`device_id`,`created_at`);
