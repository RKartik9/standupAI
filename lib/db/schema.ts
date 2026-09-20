import {
  boolean,
  date,
  integer,
  pgTable,
  real,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Users (mirror of Clerk)
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Organizations — the tenant. One license = one organization.
// Carries the customer's own working-calendar rules.
// ---------------------------------------------------------------------------

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  licenseStatus: varchar("license_status", { length: 20 })
    .notNull()
    .default("active"),
  // Working calendar (admin-configurable). 0 = Sunday ... 6 = Saturday.
  workingDays: integer("working_days")
    .array()
    .notNull()
    .default(sql`'{1,2,3,4,5,6}'::integer[]`),
  workStart: time("work_start").notNull().default("10:00"),
  workEnd: time("work_end").notNull().default("18:00"),
  timezone: varchar("timezone", { length: 64 })
    .notNull()
    .default("Asia/Kolkata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const organizationHolidays = pgTable(
  "organization_holidays",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    date: date("date", { mode: "string" }).notNull(),
    label: varchar("label", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("org_holiday_unique").on(t.organizationId, t.date)],
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    role: varchar("role", { length: 20 }).notNull().default("member"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("org_member_unique").on(t.organizationId, t.userId)],
);

// ---------------------------------------------------------------------------
// Teams — freeform groups the admin names inside an organization.
// ---------------------------------------------------------------------------

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  archived: boolean("archived").notNull().default(false),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamId: uuid("team_id")
      .references(() => teams.id, { onDelete: "cascade" })
      .notNull(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("team_member_unique").on(t.teamId, t.userId)],
);

// ---------------------------------------------------------------------------
// Standups — organization-wide feed
// ---------------------------------------------------------------------------

export const updates = pgTable("updates", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  teamId: uuid("team_id").references(() => teams.id, {
    onDelete: "set null",
  }),
  userId: varchar("user_id", { length: 255 }).notNull(),
  userName: varchar("user_name", { length: 255 }).notNull(),
  userImage: text("user_image"),
  did: text("did").notNull(),
  willDo: text("will_do").notNull(),
  blockers: text("blockers"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiSummaries = pgTable("ai_summaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  teamId: uuid("team_id").references(() => teams.id, {
    onDelete: "set null",
  }),
  summary: text("summary").notNull(),
  generatedBy: varchar("generated_by", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invites = pgTable("invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Projects, tasks, and schedule audit
// ---------------------------------------------------------------------------

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  startDate: timestamp("start_date").defaultNow().notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  teamId: uuid("team_id").references(() => teams.id, {
    onDelete: "set null",
  }),
  title: varchar("title", { length: 200 }).notNull(),
  rawInput: text("raw_input"),
  assigneeId: varchar("assignee_id", { length: 255 }).notNull(),
  estimateHours: real("estimate_hours").notNull().default(8),
  // 1 = critical, 2 = high, 3 = normal, 4 = low
  priority: integer("priority").notNull().default(3),
  status: varchar("status", { length: 20 }).notNull().default("todo"),
  scheduledStart: timestamp("scheduled_start").notNull(),
  scheduledEnd: timestamp("scheduled_end").notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scheduleEvents = pgTable("schedule_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  taskId: uuid("task_id")
    .references(() => tasks.id, { onDelete: "cascade" })
    .notNull(),
  triggeredByTaskId: uuid("triggered_by_task_id").references(
    () => tasks.id,
    { onDelete: "set null" },
  ),
  previousStart: timestamp("previous_start"),
  previousEnd: timestamp("previous_end"),
  newStart: timestamp("new_start").notNull(),
  newEnd: timestamp("new_end").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type OrganizationHoliday = typeof organizationHolidays.$inferSelect;
export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type Update = typeof updates.$inferSelect;
export type NewUpdate = typeof updates.$inferInsert;
export type AISummary = typeof aiSummaries.$inferSelect;
export type Invite = typeof invites.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type ScheduleEvent = typeof scheduleEvents.$inferSelect;

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = 1 | 2 | 3 | 4;
