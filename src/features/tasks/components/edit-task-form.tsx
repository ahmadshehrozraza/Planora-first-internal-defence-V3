"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editTaskSchema } from "../schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DatePicker } from "@/components/date-picker";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { Task, TaskPriority, TaskStatus, TaskType } from "../types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useUpdateTask } from "../api/use-update-task";
import { useCurrentMember } from "@/features/members/hooks/current-user-role";

interface EditTaskFormProps {
    onCancel?: () => void;
    projectOptions: { id: string, name: string, imageUrl: string }[];
    memberOptions: { id: string, name: string }[];
    initialValues: Task;
};

export const EditTaskForm = ({ onCancel, projectOptions, memberOptions, initialValues }: EditTaskFormProps) => {

    const workspaceId = useWorkspaceId();

    const { isAdmin, member } = useCurrentMember(); 

    const { mutate, isPending } = useUpdateTask();

    const form = useForm<z.infer<typeof editTaskSchema>>({
        resolver: zodResolver(editTaskSchema),
        defaultValues: {
            ...initialValues,
            dueDate: initialValues.dueDate ? new Date(initialValues.dueDate) : undefined,
            status: initialValues.status as TaskStatus,
            assignedBy: initialValues.assignedByUser?.$id
        },
    });

    if (!workspaceId) return null;

    const onSubmit = (values: z.infer<typeof editTaskSchema>) => {
        
        const finalValues = {
            ...values,
            assignedBy: member?.$id 
        };

        console.log("Submitting Values: ", finalValues);
        
        mutate(
            {
                json: finalValues,
                param: { taskId: initialValues.$id }
            },
            {
                onSuccess() {
                    form.reset();
                    onCancel?.();
                },
            }
        );
    };

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex p-2">
                <CardTitle className="text-xl font-bold">
                    Edit Task
                </CardTitle>
            </CardHeader>

            <div className="px-3">
                <Separator />
            </div>
            <CardContent className="p-4 ">
                <Form {...form} >
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex h-full flex-col gap-y-5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Task Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter task name"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date</FormLabel>
                                        <FormControl>
                                            <DatePicker 
                                                {...field}
                                                value={field.value ? new Date(field.value) : undefined} 
                                                onChange={(date) => field.onChange(date)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="assigneeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assignee</FormLabel>
                                        <Select 
                                            defaultValue={field.value} 
                                            onValueChange={field.onChange}
                                            disabled={!isAdmin} // Sirf admin change kar sake
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Assignee" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="no-assignee">
                                                    <div className="flex items-center gap-x-2">
                                                        <MemberAvatar
                                                            name={null}
                                                            className="size-6"
                                                        />
                                                        No Assignee
                                                    </div>
                                                </SelectItem>
                                                {memberOptions.map((member) => (
                                                    <SelectItem key={member.id} value={member.id}>
                                                        <div className="flex items-center gap-x-2">
                                                            <MemberAvatar className="size-6" name={member.name} />
                                                            {member.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select defaultValue={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={TaskStatus.BACKLOG}>Backlog</SelectItem>
                                                <SelectItem value={TaskStatus.TODO}>Todo</SelectItem>
                                                <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                                                <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
                                                <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="projectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project</FormLabel>
                                        <Select defaultValue={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Project" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {projectOptions.map((project) => (
                                                    <SelectItem key={project.id} value={project.id}>
                                                        <div className="flex items-center gap-x-2">
                                                            <ProjectAvatar
                                                                className="size-6"
                                                                name={project.name}
                                                                image={project.imageUrl}
                                                            />
                                                            {project.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Task description</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter task description"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="taskType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Task Type</FormLabel>
                                        <Select defaultValue={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Task Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={TaskType.TASK}>Task</SelectItem>
                                                <SelectItem value={TaskType.FEATURE}>Feature</SelectItem>
                                                <SelectItem value={TaskType.DOCUMENTATION}>Documentation</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select defaultValue={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                                                <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                                                <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="assignedBy"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assigned By</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={isAdmin ? member?.name : (initialValues.assignedByUser?.name || "Unknown")}
                                                readOnly
                                                disabled
                                                className="bg-muted cursor-not-allowed"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="mb-5 mt-5">
                            <Separator />
                        </div>

                        <div className="flex items-center justify-between">
                            <Button
                                type="button"
                                size="sm"
                                variant="secondry"
                                onClick={onCancel}
                                disabled={isPending}
                                className={cn(!onCancel && "invisible")}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                size="sm"
                                disabled={isPending}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
};