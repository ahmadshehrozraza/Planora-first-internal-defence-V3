"use client";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";
import { Task } from "@/features/tasks/types";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { formatDistanceToNow } from "date-fns";
import {
    PlusIcon,
    CalendarIcon,
    SettingsIcon,
    Calendar,
    Crown,
    User,
    CheckCircle,
    ArrowUpRight,
    ListTodo
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Project } from "@/features/projects/types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Member } from "@/features/members/types";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useCurrentMember } from "@/features/members/hooks/current-user-role";
import { Badge } from "@/components/ui/badge";
import { snakeCaseToTitleCase } from "@/lib/utils";

export const WorkspaceIdClient = () => {
    const workspaceId = useWorkspaceId();
    if (!workspaceId) return null;

    const { isAdmin } = useCurrentMember();

    const { data: workspace, isLoading: isLoadingWorkspace } = useGetWorkspaceAnalytics({ workspaceId });
    const { data: task, isLoading: isLoadingTask } = useGetTasks({ workspaceId });
    const { data: project, isLoading: isLoadingProject } = useGetProjects({ workspaceId });
    const { data: member, isLoading: isLoadingMember } = useGetMembers({ workspaceId });

    const isLoading =
        isLoadingMember ||
        isLoadingWorkspace ||
        isLoadingProject ||
        isLoadingTask;

    if (isLoading) {
        return <PageLoader />;
    }

    if (
        !workspace ||
        !task ||
        !project ||
        !member
    ) {
        return <PageError message="Failed to load workspace data" />;
    }

    return (
        <div className="h-full w-full flex flex-col space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <TaskList
                    data={task.documents}
                    total={task.total}
                    members={member.documents}
                />

                <ProjectList
                    data={project.documents}
                    total={project.total}
                />

                {isAdmin &&
                    <MembersList
                        data={member.documents}
                        total={member.total}
                    />
                }
            </div>
        </div>
    );
};

interface TaskListProps {
    data: Task[];
    total: number;
    members: Member[];
};

export const TaskList = ({
    data,
    total,
    members,
}: TaskListProps) => {
    const { open: createTask } = useCreateTaskModal();
    const workspaceId = useWorkspaceId();
    if (!workspaceId) return null;

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Tasks ({total})
                    </p>
                    <Button
                        variant="muted"
                        size="icon"
                        onClick={createTask}
                    >
                        <PlusIcon className="size-4 text-neutral-800" />
                    </Button>
                </div>
                <Separator className="my-2" />

                <ul className="flex flex-col gap-y-3">
                    {data.map((task) => {
                        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

                        return (
                            <li key={task.$id}>
                                <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                                    <Card className="shadow-none rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 border">
                                        <CardContent className="p-3">

                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-base font-semibold text-gray-900 line-clamp-1">
                                                        {task.name}
                                                    </p>
                                                </div>

                                                <div className={`flex items-center gap-x-1 px-2 rounded-md text-xs font-medium `}>
                                                    {<Badge variant={task.status} >
                                                        
                                                        {snakeCaseToTitleCase(task.status)}
                                                    </Badge>}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-1">
                                                <div className="flex items-center gap-x-4">
                                                    <div className="flex items-center gap-x-2">
                                                        <ProjectAvatar
                                                            name={task.project?.name}
                                                            image={task.project?.imageUrl}
                                                            className="size-6"
                                                            fallbackClassName="text-xs font-semibold"
                                                        />
                                                        <span className="text-sm text-gray-700 font-medium">
                                                            {task.project?.name}
                                                        </span>
                                                    </div>

                                                    {task.priority && (
                                                        <div className={`px-2 py-1 rounded text-xs font-medium `}>
                                                            <Badge variant={task.priority}>{task.priority}</Badge>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={`text-sm flex items-center gap-x-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                                    <CalendarIcon className={`size-3 ${isOverdue ? 'text-red-600' : ''}`} />
                                                    <span className={isOverdue ? 'font-semibold' : ''}>
                                                        {isOverdue ? 'Overdue' : formatDistanceToNow(new Date(task.dueDate))}
                                                    </span>
                                                    <ArrowUpRight className="size-3 ml-1 text-gray-400" />
                                                </div>
                                            </div>

                                        </CardContent>
                                    </Card>
                                </Link>
                            </li>
                        );
                    })}

                    {data.length === 0 && (
                        <li className="text-center py-8">
                            <div className="text-muted-foreground">
                                <div className="mx-auto size-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                    <ListTodo className="size-6 text-gray-400" />
                                </div>
                                <p className="text-lg font-medium">No tasks found</p>
                                <p className="text-sm">Create your first task to get started</p>
                            </div>
                        </li>
                    )}
                </ul>
                <Button
                    variant="muted"
                    className="mt-3 w-full"
                    asChild
                >
                    <Link href={`/workspaces/${workspaceId}/tasks`}>
                        View All Tasks
                    </Link>
                </Button>
            </div>
        </div>
    )
}

interface ProjectListProps {
    data: Project[];
    total: number;
};

export const ProjectList = ({
    data,
    total,
}: ProjectListProps) => {
    const { isAdmin } = useCurrentMember();
    const { open: createProject } = useCreateProjectModal();
    const workspaceId = useWorkspaceId();
    if (!workspaceId) return null;

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Projects ({total})
                    </p>
                    {isAdmin &&
                        <Button
                            variant="secondry"
                            size="icon"
                            onClick={createProject}
                        >
                            <PlusIcon className="size-4 text-neutral-800" />
                        </Button>
                    }
                </div>
                <Separator className="my-2" />

                <ul className="space-y-2">
                    {data.map((project) => (
                        <li key={project.$id}>
                            <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                                <Card className="shadow-none rounded-lg hover:bg-gray-50 transition p-0 border hover:border-gray-300">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-x-3">
                                                <ProjectAvatar
                                                    name={project.name}
                                                    image={project.imageUrl}
                                                    className="size-10"
                                                    fallbackClassName="text-lg"
                                                />
                                                <div className="flex flex-col">
                                                    <p className="text-lg font-medium">
                                                        {project.name}
                                                    </p>
                                                    {project.description && (
                                                        <p className="text-sm text-muted-foreground truncate max-w-md">
                                                            {project.description}
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-x-4 mt-1">
                                                        <div className="flex items-center gap-x-1 text-xs text-gray-500">
                                                            <ListTodo className="size-3" />
                                                            <span>{project.totalTasks || 0} tasks</span>
                                                        </div>

                                                        {project.completedTasks !== undefined && (
                                                            <div className="flex items-center gap-x-1 text-xs text-gray-500">
                                                                <CheckCircle className="size-3" />
                                                                <span>{project.completedTasks} completed</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-x-4">
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${project.projectStatus === "COMPLETED" ? "bg-green-100 text-green-800 border border-green-200" : "bg-blue-100 text-blue-800 border border-blue-200"}`}>
                                                    {project.projectStatus === "COMPLETED" ? "Completed" : "In Progress"}
                                                </div>

                                                {project.dueDate && (
                                                    <div className={`flex items-center gap-x-1 text-sm ${new Date(project.dueDate) < new Date() ? 'text-red-600' : 'text-muted-foreground'}`}>
                                                        <Calendar className="size-4" />
                                                        <span>
                                                            {new Date(project.dueDate).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </li>
                    ))}

                    {data.length === 0 && (
                        <li className="text-center py-8">
                            <div className="text-muted-foreground">
                                <p className="text-lg font-medium">No projects found</p>
                                <p className="text-sm">Create your first project to get started</p>
                            </div>
                        </li>
                    )}
                </ul>

                {isAdmin && (
                    <Button
                        variant="outline"
                        className="mt-3 w-full border-dashed"
                        onClick={createProject}
                    >
                        <PlusIcon className="size-4 mr-2" />
                        Add New Project
                    </Button>
                )}
            </div>
        </div>
    )
}

interface MembersListProps {
    data: Member[];
    total: number;
};

export const MembersList = ({
    data,
    total,
}: MembersListProps) => {
    const workspaceId = useWorkspaceId();
    if (!workspaceId) return null;

    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Members ({total})
                    </p>
                    <Button
                        variant="secondry"
                        size="icon"
                        asChild
                    >
                        <Link href={`/workspaces/${workspaceId}/members`}>
                            <SettingsIcon className="size-4 text-neutral-800" />
                        </Link>
                    </Button>
                </div>
                <Separator className="my-2" />

                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.map((member) => (
                        <li key={member.$id}>
                            <Card className="shadow-none rounded-lg overflow-hidden border hover:border-gray-300 hover:shadow-sm transition-all">
                                <CardContent className="p-4">
                                    <div className="flex flex-col items-center">
                                        <MemberAvatar
                                            name={member.name}
                                            className="size-16 border-4 border-white shadow-md"
                                            src={member?.memberImage}
                                            fallbackClassname="text-lg font-bold"
                                        />

                                        <div className="mt-3 text-center">
                                            <p className="text-base font-semibold text-gray-900 line-clamp-1">
                                                {member.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                {member.email}
                                            </p>
                                            <div className={`inline-flex items-center gap-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium mt-3 ${member?.role === "ADMIN"
                                                ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200"
                                                : "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200"
                                                }`}>
                                                {member?.role === "ADMIN" ? (
                                                    <>
                                                        <Crown className="size-3.5" />
                                                        <span className="font-semibold">Admin</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <User className="size-3.5" />
                                                        <span className="font-semibold">Member</span>
                                                    </>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}