CREATE TABLE IF NOT EXISTS "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"industry" text NOT NULL,
	"primary_contact_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"account_manager" text NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL,
	"remarks" text,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "daily_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"updated_by" text NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"designation" text NOT NULL,
	"department" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"reporting_manager" text NOT NULL,
	"current_allocation" integer DEFAULT 0 NOT NULL,
	"availability_status" text DEFAULT 'Available' NOT NULL,
	"remarks" text,
	"deleted_at" timestamp,
	CONSTRAINT "employees_phone_unique" UNIQUE("phone"),
	CONSTRAINT "employees_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"owner" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"due_date" timestamp NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"status" text NOT NULL,
	"remarks" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_resources" (
	"project_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	CONSTRAINT "project_resources_project_id_employee_id_pk" PRIMARY KEY("project_id","employee_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"name" text NOT NULL,
	"domain" text NOT NULL,
	"project_manager" text NOT NULL,
	"project_lead" text NOT NULL,
	"status" text DEFAULT 'Not Started' NOT NULL,
	"priority" text DEFAULT 'Medium' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp NOT NULL,
	"expected_completion_date" timestamp NOT NULL,
	"description" text NOT NULL,
	"remarks" text,
	"deleted_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "daily_updates" ADD CONSTRAINT "daily_updates_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_resources" ADD CONSTRAINT "project_resources_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_resources" ADD CONSTRAINT "project_resources_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "project_chrono_idx" ON "daily_updates" USING btree ("project_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "client_project_unique_idx" ON "projects" USING btree ("client_id","name");