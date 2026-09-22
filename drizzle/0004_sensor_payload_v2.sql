ALTER TABLE `sensor_readings` ADD `sensor_type` text;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `temperature_sensor_sda_pin` integer;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `temperature_sensor_scl_pin` integer;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `temperature_sensor_i2c_address` integer;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `moisture_sensor_probe_1_ao_pin` integer;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `moisture_sensor_probe_1_raw_adc` integer;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `moisture_sensor_probe_1_moisture_percent` real;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `moisture_sensor_probe_1_power_pin` integer;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `moisture_sensor_probe_2_ao_pin` integer;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `moisture_sensor_probe_2_raw_adc` integer;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `moisture_sensor_probe_2_moisture_percent` real;
--> statement-breakpoint
ALTER TABLE `sensor_readings` ADD `moisture_sensor_probe_2_power_pin` integer;
