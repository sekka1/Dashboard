ALTER TABLE `sensor_readings` ADD `temperature_c` real;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `temperature_f` real;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `temperature_sensor_pin` integer;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `temperature_sensor_connected` integer;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `temperature_sensor_count` integer;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `moisture_sensor_raw_adc` integer;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `moisture_sensor_air_value` integer;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `moisture_sensor_water_value` integer;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `moisture_sensor_moisture_percent` real;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `moisture_sensor_percent` real;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `moisture_sensor_calibrated_percent` real;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `moisture_sensor_pin` integer;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `moisture_sensor_reading_time_ms` integer;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `sensor_timestamp` integer;
