"use client";

import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";
import { PenIcon } from "lucide-react";
import Link from "next/link";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { Button } from "@/components/ui/button";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { useGetProjectAnalytics } from "@/features/projects/api/use-get-project-analytics";
import { useCurrentMember } from "@/features/members/hooks/current-user-role";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const ProjectIdClient = () => {

    const projectId = useProjectId();
    const { isAdmin } = useCurrentMember();
    const { data: project, isLoading: isLoadingProject } = useGetProject({ projectId });
    const isLoading = isLoadingProject;

    if (isLoading) {
        return <PageLoader />
    }

    if (!project) {
        return <PageError message="Project not found" />
    }



    return (
        <div className="flex flex-col w-full gap-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <ProjectAvatar
                        name={project.name}
                        image={project.imageUrl}
                        className="size-8"
                    />
                    <p className="text-lg font-semibold">{project.name}</p>
                </div>

                <Badge
                    variant={
                        project.projectStatus === "COMPLETED"
                            ? "default"
                            : "outline"
                    }
                    className={cn(
                        "text-xs",
                        project.projectStatus === "COMPLETED"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                    )}
                >
                    {project.projectStatus === "COMPLETED"
                        ? "Completed"
                        : "In Progress"
                    }
                </Badge>

                {isAdmin &&
                    <div>
                        <Button
                            variant="secondry"
                            size="sm"
                            asChild
                        >
                            <Link
                                href={`/workspaces/${project.workspaceId}/projects/${project.$id}/settings`}>
                                <PenIcon className="size-4 mr-2" />
                                Edit Project
                            </Link>
                        </Button>

                    </div>
                }
            </div>
            <TaskViewSwitcher />
        </div>
    )
}