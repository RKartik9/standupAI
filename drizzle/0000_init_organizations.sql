-- Idempotent migration: safe on a fresh database AND on the pre-existing
-- StandupAI schema (users, teams, team_members, updates, ai_summaries, invites).
-- Legacy teams are lifted into organizations: each legacy team becomes an
-- organization with the SAME id, and stays as the first team under that org.

CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(255),
	"last_name" varchar(255),
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"license_status" varchar(20) DEFAULT 'active' NOT NULL,
	"working_days" integer[] DEFAULT '{1,2,3,4,5,6}'::integer[] NOT NULL,
	"work_start" time DEFAULT '10:00' NOT NULL,
	"work_end" time DEFAULT '18:00' NOT NULL,
	"timezone" varchar(64) DEFAULT 'Asia/Kolkata' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_holidays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"date" date NOT NULL,
	"label" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"team_id" uuid,
	"user_id" varchar(255) NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"user_image" text,
	"did" text NOT NULL,
	"will_do" text NOT NULL,
	"blockers" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"team_id" uuid,
	"summary" text NOT NULL,
	"generated_by" varchar(255) NOT NULL,
	"date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"code" varchar(20) NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invites_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(120) NOT NULL,
	"description" text,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"team_id" uuid,
	"title" varchar(200) NOT NULL,
	"raw_input" text,
	"assignee_id" varchar(255) NOT NULL,
	"estimate_hours" real DEFAULT 8 NOT NULL,
	"priority" integer DEFAULT 3 NOT NULL,
	"status" varchar(20) DEFAULT 'todo' NOT NULL,
	"scheduled_start" timestamp NOT NULL,
	"scheduled_end" timestamp NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "schedule_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"triggered_by_task_id" uuid,
	"previous_start" timestamp,
	"previous_end" timestamp,
	"new_start" timestamp NOT NULL,
	"new_end" timestamp NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- Legacy shape adjustments (no-ops on a fresh database)
-- ---------------------------------------------------------------------------
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "organization_id" uuid;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN IF NOT EXISTS "archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "updates" ADD COLUMN IF NOT EXISTS "organization_id" uuid;--> statement-breakpoint
ALTER TABLE "updates" ALTER COLUMN "team_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_summaries" ADD COLUMN IF NOT EXISTS "organization_id" uuid;--> statement-breakpoint
ALTER TABLE "ai_summaries" ALTER COLUMN "team_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invites" ADD COLUMN IF NOT EXISTS "organization_id" uuid;--> statement-breakpoint

-- Each legacy team becomes an organization with the same id.
INSERT INTO "organizations" ("id", "name", "created_by", "created_at", "updated_at")
SELECT "id", "name", "created_by", "created_at", "updated_at"
FROM "teams"
WHERE "organization_id" IS NULL
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint
UPDATE "teams" SET "organization_id" = "id" WHERE "organization_id" IS NULL;--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "org_holiday_unique" ON "organization_holidays" USING btree ("organization_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "org_member_unique" ON "organization_members" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "team_member_unique" ON "team_members" USING btree ("team_id","user_id");--> statement-breakpoint

-- Legacy team members become organization members (keeping their role),
-- then the per-team role column is dropped (role now lives on the org).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'team_members' AND column_name = 'role'
  ) THEN
    INSERT INTO "organization_members" ("organization_id", "user_id", "role", "joined_at")
    SELECT t."organization_id", tm."user_id", COALESCE(tm."role", 'member'), tm."joined_at"
    FROM "team_members" tm
    JOIN "teams" t ON t."id" = tm."team_id"
    ON CONFLICT ("organization_id", "user_id") DO NOTHING;

    ALTER TABLE "team_members" DROP COLUMN "role";
  END IF;
END $$;--> statement-breakpoint

UPDATE "updates" SET "organization_id" = "team_id" WHERE "organization_id" IS NULL AND "team_id" IS NOT NULL;--> statement-breakpoint
DELETE FROM "updates" WHERE "organization_id" IS NULL;--> statement-breakpoint
ALTER TABLE "updates" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint

UPDATE "ai_summaries" SET "organization_id" = "team_id" WHERE "organization_id" IS NULL AND "team_id" IS NOT NULL;--> statement-breakpoint
DELETE FROM "ai_summaries" WHERE "organization_id" IS NULL;--> statement-breakpoint
ALTER TABLE "ai_summaries" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint

-- Invites move from team to organization.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'invites' AND column_name = 'team_id'
  ) THEN
    UPDATE "invites" SET "organization_id" = "team_id" WHERE "organization_id" IS NULL;
    ALTER TABLE "invites" DROP COLUMN "team_id";
  END IF;
END $$;--> statement-breakpoint
DELETE FROM "invites" WHERE "organization_id" IS NULL;--> statement-breakpoint
ALTER TABLE "invites" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint

ALTER TABLE "teams" ALTER COLUMN "organization_id" SET NOT NULL;--> statement-breakpoint

-- ---------------------------------------------------------------------------
-- Foreign keys (drop + re-add so legacy constraints pick up new ON DELETE rules)
-- ---------------------------------------------------------------------------
ALTER TABLE "organization_holidays" DROP CONSTRAINT IF EXISTS "organization_holidays_organization_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "organization_holidays" ADD CONSTRAINT "organization_holidays_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" DROP CONSTRAINT IF EXISTS "organization_members_organization_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "teams_organization_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" DROP CONSTRAINT IF EXISTS "team_members_team_id_teams_id_fk";--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "updates" DROP CONSTRAINT IF EXISTS "updates_organization_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "updates" ADD CONSTRAINT "updates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "updates" DROP CONSTRAINT IF EXISTS "updates_team_id_teams_id_fk";--> statement-breakpoint
ALTER TABLE "updates" ADD CONSTRAINT "updates_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summaries" DROP CONSTRAINT IF EXISTS "ai_summaries_organization_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "ai_summaries" ADD CONSTRAINT "ai_summaries_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summaries" DROP CONSTRAINT IF EXISTS "ai_summaries_team_id_teams_id_fk";--> statement-breakpoint
ALTER TABLE "ai_summaries" ADD CONSTRAINT "ai_summaries_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" DROP CONSTRAINT IF EXISTS "invites_organization_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_organization_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_project_id_projects_id_fk";--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_organization_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_team_id_teams_id_fk";--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_events" DROP CONSTRAINT IF EXISTS "schedule_events_organization_id_organizations_id_fk";--> statement-breakpoint
ALTER TABLE "schedule_events" ADD CONSTRAINT "schedule_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_events" DROP CONSTRAINT IF EXISTS "schedule_events_project_id_projects_id_fk";--> statement-breakpoint
ALTER TABLE "schedule_events" ADD CONSTRAINT "schedule_events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_events" DROP CONSTRAINT IF EXISTS "schedule_events_task_id_tasks_id_fk";--> statement-breakpoint
ALTER TABLE "schedule_events" ADD CONSTRAINT "schedule_events_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_events" DROP CONSTRAINT IF EXISTS "schedule_events_triggered_by_task_id_tasks_id_fk";--> statement-breakpoint
ALTER TABLE "schedule_events" ADD CONSTRAINT "schedule_events_triggered_by_task_id_tasks_id_fk" FOREIGN KEY ("triggered_by_task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;
