import { z } from "zod";

export const createProjectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    workspaceId: z.string(),
    imageUrl: z.union([
        z.instanceof(File),
        z.string().transform((value) => value === "" ? undefined : value),
    ])
    .optional(),
    projectStatus: z.enum(["IN_PROGRESS", "COMPLETED"]).default("IN_PROGRESS"),
    dueDate: z.coerce.date().optional(),
    description: z.string().optional(),
});

export const updateProjectSchema = z.object({
    name: z.string().trim().min(1, "Minimum 1 character required").optional(),
    imageUrl: z.union([
        z.instanceof(File),
        z.string(),
    ])
    .optional(),
    workspaceId: z.string(),
    projectStatus: z.enum(["IN_PROGRESS", "COMPLETED"]),
    dueDate: z.coerce.date().optional(),
    description: z.string().optional(),
}); 