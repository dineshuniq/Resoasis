"use server";

import { db } from "@/db";
import { clients, projects, employees, milestones, dailyUpdates, projectStatusEnum, priorityLevelsEnum, employeeAvailabilityEnum } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ==========================================
// 1. CLIENT ACTIONS
// ==========================================

export async function createClient(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const industry = formData.get("industry") as string;
    const primaryContactName = formData.get("primaryContactName") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const accountManager = formData.get("accountManager") as string;
    const remarks = formData.get("remarks") as string;

    await db.insert(clients).values({
      name,
      industry,
      primaryContactName,
      phone,
      email,
      accountManager,
      remarks: remarks || null,
    });

    revalidatePath("/clients");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function softDeleteClient(clientId: string) {
  try {
    // Constraint: Deleting a Client shall not automatically delete Projects (Keep history intact)
    await db
      .update(clients)
      .set({ deletedAt: new Date() })
      .where(eq(clients.id, clientId));

    revalidatePath("/clients");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ==========================================
// 2. PROJECT ACTIONS
// ==========================================

export async function createProject(formData: FormData) {
  try {
    const clientId = formData.get("clientId") as string;
    const name = formData.get("name") as string;
    const domain = formData.get("domain") as string;
    const projectManager = formData.get("projectManager") as string;
    const projectLead = formData.get("projectLead") as string;
    const description = formData.get("description") as string;
    const remarks = formData.get("remarks") as string;
    
    const status = formData.get("status") as typeof projectStatusEnum[number];
    const priority = formData.get("priority") as typeof priorityLevelsEnum[number];
    
    // Constraint: Progress integer validation between 0 and 100
    const progressRaw = parseInt(formData.get("progress") as string, 10);
    const progress = Math.min(Math.max(isNaN(progressRaw) ? 0 : progressRaw, 0), 100);

    const startDate = new Date(formData.get("startDate") as string);
    const expectedCompletionDate = new Date(formData.get("expectedCompletionDate") as string);

    await db.insert(projects).values({
      clientId,
      name,
      domain,
      projectManager,
      projectLead,
      status: status || "Not Started",
      priority: priority || "Medium",
      progress,
      startDate,
      expectedCompletionDate,
      description,
      remarks: remarks || null,
    });

    revalidatePath("/projects");
    revalidatePath(`/clients/${clientId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateProjectProgress(projectId: string, rawProgress: number) {
  try {
    // Constraint: Integer checks (0-100)
    const progress = Math.min(Math.max(Math.floor(rawProgress), 0), 100);

    await db
      .update(projects)
      .set({ progress })
      .where(eq(projects.id, projectId));

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function softDeleteProject(projectId: string, clientId: string) {
  try {
    await db
      .update(projects)
      .set({ deletedAt: new Date() })
      .where(eq(projects.id, projectId));

    revalidatePath("/projects");
    revalidatePath(`/clients/${clientId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ==========================================
// 3. EMPLOYEE ACTIONS
// ==========================================

export async function createEmployee(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const designation = formData.get("designation") as string;
    const department = formData.get("department") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const reportingManager = formData.get("reportingManager") as string;
    const remarks = formData.get("remarks") as string;
    
    const availabilityStatus = formData.get("availabilityStatus") as typeof employeeAvailabilityEnum[number];
    
    const allocationRaw = parseInt(formData.get("currentAllocation") as string, 10);
    const currentAllocation = isNaN(allocationRaw) ? 0 : allocationRaw;

    await db.insert(employees).values({
      name,
      designation,
      department,
      phone, // Database unique index intercepts duplications
      email, // Database unique index intercepts duplications
      reportingManager,
      currentAllocation,
      availabilityStatus: availabilityStatus || "Available",
      remarks: remarks || null,
    });

    revalidatePath("/employees");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ==========================================
// 4. DAILY UPDATE ACTION (Core Activity Log)
// ==========================================

export async function addDailyUpdate(projectId: string, description: string, updatedBy: string) {
  try {
    // Constraint: Plain text only. No formatting, structural clean sanitize.
    const cleanDescription = description.replace(/<[^>]*>/g, "").trim();

    if (!cleanDescription) {
      throw new Error("Log description content cannot be left empty.");
    }

    await db.insert(dailyUpdates).values({
      projectId,
      updatedBy,
      description: cleanDescription,
      date: new Date(), // Enforces standard chronological log indexing
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ==========================================
// 5. MILESTONE ACTION
// ==========================================

export async function createMilestone(projectId: string, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const owner = formData.get("owner") as string;
    const remarks = formData.get("remarks") as string;
    const status = formData.get("status") as string;
    
    const startDate = new Date(formData.get("startDate") as string);
    const dueDate = new Date(formData.get("dueDate") as string);
    
    const progressRaw = parseInt(formData.get("progress") as string, 10);
    const progress = Math.min(Math.max(isNaN(progressRaw) ? 0 : progressRaw, 0), 100);

    await db.insert(milestones).values({
      projectId,
      title,
      owner,
      startDate,
      dueDate,
      progress,
      status: status || "Pending",
      remarks: remarks || null,
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}