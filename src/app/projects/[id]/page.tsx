import { db } from "@/db";
import { projects, employees } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProjectDetailView } from "./project-detail-view";
import { syncAllEmployeeAvailabilities } from "@/app/actions";

interface Props {
  params: { id: string };
}

export default async function ProjectDetailPage({ params }: Props) {
  // Self-heal employee availability status inconsistencies in the DB
  await syncAllEmployeeAvailabilities();

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, params.id), isNull(projects.deletedAt)),
    with: {
      client: true,
      milestones: true,
      dailyUpdates: {
        orderBy: (updates, { desc }) => [desc(updates.date)]
      },
      resources: {
        with: {
          employee: true
        }
      }
    }
  });

  const allEmployees = await db.query.employees.findMany({
    where: isNull(employees.deletedAt),
    orderBy: (emp, { asc }) => [asc(emp.name)]
  });

  if (!project) {
    notFound();
  }

  // Cast project types for TypeScript safety
  const typedProject = {
    ...project,
    milestones: project.milestones.map(m => ({
      ...m,
      remarks: m.remarks ?? null
    })),
    remarks: project.remarks ?? null
  };

  return (
    <ProjectDetailView project={typedProject} allEmployees={allEmployees} />
  );
}