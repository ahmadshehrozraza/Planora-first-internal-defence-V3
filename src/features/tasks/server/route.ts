import { z } from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { createTaskSchema, editTaskSchema } from "../schemas";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { Task, TaskStatus, TaskType, TaskPriority } from "../types";
import { createAdminClient } from "@/lib/appwrite";
import { Project } from "@/features/projects/types";

const app = new Hono()
    .delete(
        "/:taskId",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const { taskId } = c.req.param();

            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id,
            });


            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            await databases.deleteDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            return c.json({ data: { $id: taskId, deleted: true, }, }, 200)
        }
    )


    .get(
    "/",
    sessionMiddleware,
    zValidator(
        "query",
        z.object({
            workspaceId: z.string(),
            projectId: z.string().nullish(),
            assigneeId: z.string().nullish(),
            status: z.string().nullish(),
            search: z.string().nullish(),
            dueDate: z.string().nullish(),
            description: z.string().nullish(),
            taskType: z.string().nullish(),
            priority: z.string().nullish(),
        })
    ),
    async (c) => {
        const { users } = await createAdminClient();
        const databases = c.get("databases");
        const user = c.get("user");

        const {
            workspaceId,
            projectId,
            status,
            search,
            assigneeId,
            dueDate,
            description,
            taskType,
            priority,
        } = c.req.valid("query");

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const memberRole = member.role;
        const memberId = member.$id;

        const query = [
            Query.equal("workspaceId", workspaceId),
            Query.orderDesc("$createdAt")
        ];

        if (memberRole !== "ADMIN") {
            const assignedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("workspaceId", workspaceId),
                    Query.equal("assigneeId", memberId),
                    Query.select(["projectId"]),
                    Query.limit(100),
                ],
            );

            const projectIds = assignedTasks.documents
                .map(task => task.projectId)
                .filter((id): id is string => !!id && id !== "no-project" && id !== "");

            if (projectIds.length === 0) {
                return c.json({
                    data: { total: 0, documents: [] },
                    meta: {
                        userRole: memberRole,
                        canViewAllTasks: false,
                        accessibleProjects: 0
                    }
                });
            }
            query.push(Query.contains("projectId", projectIds));
        }

        if (projectId && projectId !== "all") {
            query.push(Query.equal("projectId", projectId));
        }

        if (status && status !== "all") {
            if (Object.values(TaskStatus).includes(status as TaskStatus)) {
                query.push(Query.equal("status", status));
            }
        }

        if (taskType && taskType !== "all") {
            if (Object.values(TaskType).includes(taskType as TaskType)) {
                query.push(Query.equal("taskType", taskType));
            }
        }

        if (priority && priority !== "all") {
            if (Object.values(TaskPriority).includes(priority as TaskPriority)) {
                query.push(Query.equal("priority", priority));
            }
        }

        // FIX: Handle "no-assignee" value correctly
        if (assigneeId && assigneeId !== "all-tasks") {
            if (assigneeId === "no-assignee") {
                // CHANGED: Use Query.equal for "no-assignee" string
                query.push(Query.equal("assigneeId", "no-assignee"));
            } else {
                query.push(Query.equal("assigneeId", assigneeId));
            }
        }

        if (dueDate) {
            try {
                const parsedDate = new Date(dueDate);
                const localYear = parsedDate.getFullYear();
                const localMonth = parsedDate.getMonth();
                const localDay = parsedDate.getDate();

                const startOfDay = new Date(localYear, localMonth, localDay, 0, 0, 0, 0);
                const endOfDay = new Date(localYear, localMonth, localDay, 23, 59, 59, 999);

                query.push(Query.greaterThanEqual("dueDate", startOfDay.toISOString()));
                query.push(Query.lessThanEqual("dueDate", endOfDay.toISOString()));

            } catch (error) {
                console.error("Date conversion error:", error);
            }
        }

        if (search) {
            query.push(Query.search("name", search));
        }

        if (description) {
            query.push(Query.search("description", description));
        }

        const tasks = await databases.listDocuments<Task>(
            DATABASE_ID,
            TASKS_ID,
            query,
        );

        // FIX: Also update the assignee population logic
        const projectIds = tasks.documents.map((task) => task.projectId).filter(Boolean);
        const assigneeIds = tasks.documents
            .map((task) => task.assigneeId)
            .filter((id): id is string => !!id && id !== "no-assignee");

        const projects = await databases.listDocuments<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectIds?.length > 0 ? [Query.contains("$id", projectIds)] : [],
        );

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            assigneeIds?.length > 0 ? [Query.contains("$id", assigneeIds)] : [],
        );

        const assignees = await Promise.all(
            members.documents.map(async (member) => {
                try {
                    const user = await users.get(member.userId);
                    return {
                        ...member,
                        name: user.name || user.email,
                        email: user.email,
                    }
                } catch (error) {
                    return {
                        ...member,
                        name: "Deleted User",
                        email: "deleted@user.com",
                    }
                }
            })
        )

        const populatedTasks = tasks.documents.map((task) => {
            const project = projects.documents.find(
                (project) => project.$id === task.projectId,
            );

            // Handle "no-assignee" tasks
            const assignee = task.assigneeId === "no-assignee" 
                ? null 
                : assignees.find((assignee) => assignee.$id === task.assigneeId);

            return {
                ...task,
                project,
                assignee,
            };
        });

        return c.json({
            data: {
                ...tasks,
                documents: populatedTasks,
            },
            meta: {
                userRole: memberRole,
                canViewAllTasks: memberRole === "ADMIN",
                accessibleProjects: memberRole !== "ADMIN" ? projectIds.length : "all",
                totalTasks: tasks.total,
                filtersApplied: query.length - 2,
                noAssigneeCount: tasks.documents.filter(t => t.assigneeId === "no-assignee").length,
            }
        });
    }
)


    .post(
        "/",
        sessionMiddleware,
        zValidator("json", createTaskSchema),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const {
                name,
                status,
                workspaceId,
                projectId,
                dueDate,
                assigneeId,
                assignedBy,
                description,
                taskType,
                priority,
            } = c.req.valid("json");

            const member = getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const highestPositionTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("status", status),
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("position"),
                    Query.limit(1),
                ],
            );

            const newPosition = highestPositionTask.documents.length > 0
                ? highestPositionTask.documents[0].position + 1000
                : 1000;

            const tasks = await databases.createDocument(
                DATABASE_ID,
                TASKS_ID,
                ID.unique(),
                {
                    name,
                    status,
                    workspaceId,
                    projectId,
                    dueDate,
                    assigneeId: assigneeId,
                    assignedBy: assignedBy,
                    position: newPosition,
                    description,
                    taskType,
                    priority,
                },
            );

            return c.json({ data: tasks })
        }
    )


    .patch(
    "/:taskId",
    sessionMiddleware,
    zValidator("json", editTaskSchema), 
    async (c) => {
        try {

            const body = c.req.valid("json");

            const user = c.get("user"); 
            const databases = c.get("databases");
            const { taskId } = c.req.param();

            const updatePayload = {
                ...body,
                assignedBy: user.$id 
            };

            const updatedTask = await databases.updateDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId,
                updatePayload,
            );

            return c.json({
                success: true,
                data: updatedTask
            });

        } catch (error) {
            console.log("Update Error: ", error);
            return c.json({
                success: false,
                error: "Failed to update task"
            }, 500);
        }
    }
)


    .get(
        "/:taskId",
        sessionMiddleware,
        async (c) => {
            const currentUser = c.get("user");
            const databases = c.get("databases");
            const { users } = await createAdminClient();
            const { taskId } = c.req.param();

            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId,
            );

            const currentMember = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: currentUser.$id,
            });

            if (!currentMember) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                task.projectId,
            );

            let assignedByUser = null;

            if (task.assignedBy) {
                try {
                    const assignedByUserData = await users.get(task.assignedBy);

                    assignedByUser = {
                        $id: task.assignedBy,
                        name: assignedByUserData.name || assignedByUserData.email,
                        email: assignedByUserData.email,
                    };

                } catch (error) {
                    assignedByUser = {
                        $id: task.assignedBy,
                        name: "Unknown User",
                        email: null
                    };
                }
            }

            let assignee = null;

            if (task.assigneeId && task.assigneeId !== "no-assignee") {
                try {
                    const member = await databases.getDocument(
                        DATABASE_ID,
                        MEMBERS_ID,
                        task.assigneeId,
                    );

                    const user = await users.get(member.userId);

                    assignee = {
                        ...member,
                        name: user.name || user.email,
                        email: user.email,
                    };
                } catch (error) {
                    console.log("Assignee not found, might be deleted:", task.assigneeId);
                }
            }

            return c.json({
                data: {
                    ...task,
                    project,
                    assignee,
                    assignedByUser,
                },
            });
        }
    );


export default app;