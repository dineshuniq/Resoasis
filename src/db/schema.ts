import { pgTable, uuid, text, integer, timestamp, uniqueIndex, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==========================================
// 1. FIXED ENUMS (Strict PRD Constraints)
// ==========================================

export const projectStatusEnum = [
  'Not Started',
  'In Progress',
  'Testing',
  'Blocked',
  'Completed',
  'On Hold',
  'Cancelled'
] as const;

export const priorityLevelsEnum = [
  'Low',
  'Medium',
  'High',
  'Critical'
] as const;

export const employeeAvailabilityEnum = [
  'Available',
  'Allocated',
  'On Leave',
  'Inactive'
] as const;

// ==========================================
// 2. TABLES DEFINITIONS
// ==========================================

// --- CLIENTS ---
export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  industry: text('industry').notNull(),
  primaryContactName: text('primary_contact_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  accountManager: text('account_manager').notNull(),
  status: text('status').default('Active').notNull(), // Active / Inactive
  remarks: text('remarks'),
  deletedAt: timestamp('deleted_at'), // Soft delete flag
});

// --- PROJECTS ---
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').references(() => clients.id).notNull(),
  name: text('name').notNull(),
  domain: text('domain').notNull(),
  projectManager: text('project_manager').notNull(),
  projectLead: text('project_lead').notNull(),
  status: text('status', { enum: projectStatusEnum }).default('Not Started').notNull(),
  priority: text('priority', { enum: priorityLevelsEnum }).default('Medium').notNull(),
  progress: integer('progress').default(0).notNull(), // Restrict 0-100 in application logic
  startDate: timestamp('start_date').notNull(),
  expectedCompletionDate: timestamp('expected_completion_date').notNull(),
  description: text('description').notNull(),
  remarks: text('remarks'),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  // Constraint: Project names can repeat globally but must be unique within the same Client
  clientProjectUniqueIdx: uniqueIndex('client_project_unique_idx').on(table.clientId, table.name),
}));

// --- EMPLOYEES ---
export const employees = pgTable('employees', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  designation: text('designation').notNull(),
  department: text('department').notNull(),
  phone: text('phone').notNull().unique(), // Constraint: Unique phone numbers
  email: text('email').notNull().unique(),
  reportingManager: text('reporting_manager').notNull(),
  currentAllocation: integer('current_allocation').default(0).notNull(), // Manual 0-100%
  availabilityStatus: text('availability_status', { enum: employeeAvailabilityEnum }).default('Available').notNull(),
  remarks: text('remarks'),
  deletedAt: timestamp('deleted_at'),
});

// --- JOIN TABLE: PROJECT RESOURCES (Many-to-Many Assignment) ---
export const projectResources = pgTable('project_resources', {
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  employeeId: uuid('employee_id').references(() => employees.id, { onDelete: 'cascade' }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.projectId, table.employeeId] }),
}));

// --- MILESTONES ---
export const milestones = pgTable('milestones', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(), // Constraint: Deleting project removes milestones
  title: text('title').notNull(),
  owner: text('owner').notNull(),
  startDate: timestamp('start_date').notNull(),
  dueDate: timestamp('due_date').notNull(),
  progress: integer('progress').default(0).notNull(),
  status: text('status').notNull(),
  remarks: text('remarks'),
});

// --- DAILY UPDATES (Chronological Plain Text Log) ---
export const dailyUpdates = pgTable('daily_updates', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp('date').defaultNow().notNull(), // Chronological index setup below
  updatedBy: text('updated_by').notNull(),
  description: text('description').notNull(), // Plain text only constraint
}, (table) => ({
  // Fast lookup for chronological logs on the project detail view
  projectChronologicalUpdatesIdx: uniqueIndex('project_chrono_idx').on(table.projectId, table.date),
}));

// ==========================================
// 3. DRIZZLE RELATIONS (For clean ORM querying)
// ==========================================

export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, { fields: [projects.clientId], references: [clients.id] }),
  milestones: many(milestones),
  dailyUpdates: many(dailyUpdates),
  resources: many(projectResources),
}));

export const employeesRelations = relations(employees, ({ many }) => ({
  projects: many(projectResources),
}));

export const projectResourcesRelations = relations(projectResources, ({ one }) => ({
  project: one(projects, { fields: [projectResources.projectId], references: [projects.id] }),
  employee: one(employees, { fields: [projectResources.employeeId], references: [employees.id] }),
}));

export const milestonesRelations = relations(milestones, ({ one }) => ({
  project: one(projects, { fields: [milestones.projectId], references: [projects.id] }),
}));

export const dailyUpdatesRelations = relations(dailyUpdates, ({ one }) => ({
  project: one(projects, { fields: [dailyUpdates.projectId], references: [projects.id] }),
}));