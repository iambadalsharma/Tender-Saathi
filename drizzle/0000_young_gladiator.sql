CREATE TABLE IF NOT EXISTS `customer_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`serial_no` integer NOT NULL,
	`gem_tender_reference` text NOT NULL,
	`tech_specs_reference` text NOT NULL,
	`category` text NOT NULL,
	`contract_no` text NOT NULL,
	`contract_date` text NOT NULL,
	`organisation` text NOT NULL,
	`location` text NOT NULL,
	`work` text NOT NULL,
	`total_order_value` text NOT NULL,
	`order_status` text NOT NULL,
	`bg_value` text NOT NULL,
	`bg_number` text NOT NULL,
	`bg_issue_date` text NOT NULL,
	`timeline_of_bg` text NOT NULL,
	`bg_status` text NOT NULL,
	`collected_or_not` text NOT NULL,
	`couriered` text NOT NULL,
	`crac_link` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `customer_tenders` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`serial_no` integer NOT NULL,
	`remarks` text NOT NULL,
	`published_date` text NOT NULL,
	`submission_end_date` text NOT NULL,
	`pre_bid_date` text NOT NULL,
	`pre_bid_location` text NOT NULL,
	`to_be_applied` text NOT NULL,
	`not_applying_reason` text NOT NULL,
	`applied` text NOT NULL,
	`due_days` integer DEFAULT 0 NOT NULL,
	`tender_number` text NOT NULL,
	`tender_title` text NOT NULL,
	`consignee` text NOT NULL,
	`organisation` text NOT NULL,
	`location` text NOT NULL,
	`emd_value` text NOT NULL,
	`ra` text NOT NULL,
	`tender_value` text NOT NULL,
	`our_quoted_value` text NOT NULL,
	`result` text NOT NULL,
	`winning_value` text NOT NULL,
	`tender_link` text NOT NULL,
	`current_status` text NOT NULL,
	`folder_link` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `customers` (
	`customer_id` text PRIMARY KEY NOT NULL,
	`owner_name` text NOT NULL,
	`business_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `tender_files` (
	`id` text PRIMARY KEY NOT NULL,
	`tender_id` text NOT NULL,
	`file_name` text NOT NULL,
	`file_url` text NOT NULL,
	`file_type` text NOT NULL,
	`uploaded_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tender_id`) REFERENCES `customer_tenders`(`id`) ON UPDATE no action ON DELETE cascade
);

