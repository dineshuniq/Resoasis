import { db } from '../../../db';
import { employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EmployeeDetailView } from "./employee-detail-view";
import { syncAllEmployeeAvailabilities } from "@/app/actions";

interface Props {
  params: { id: string };
}

export default async function EmployeeDetailPage({ params }: Props) {
  // Self-heal employee availability status inconsistencies in the DB
  await syncAllEmployeeAvailabilities();

  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, params.id),
    with: {
      projects: {
        with: {
          project: true
        }
      }
    }
  });

  if (!employee) {
    notFound();
  }

  // Map database entity types for TS compiler safety
  const typedEmployee = {
    ...employee,
    remarks: employee.remarks ?? null,
    deletedAt: employee.deletedAt ?? null,
    projects: employee.projects.map(p => ({
      ...p,
      project: {
        ...p.project,
        remarks: p.project.remarks ?? null
      }
    }))
  };

  return (
    <EmployeeDetailView employee={typedEmployee} />
  );
}