"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Calendar, Save, Trash2, ImageIcon, ArrowLeftIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { redirect, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChangeEmailForm } from "./change-email-form";
import { ChangePasswordForm } from "./change-password-form";
import { DeleteUserForm } from "./delete-user-form";
import { updateProfileSchema } from "../schemas";
import { useUpdateUser } from "../api/use-update-user";
import { useCurrent } from "../api/use-current";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

export const UserProfileForm = () => {
    const { data: user, isLoading } = useCurrent();

    if (!user) redirect("/sign-in");

    const workspaceId = useWorkspaceId();

    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const { mutate, isPending } = useUpdateUser();

    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


    const form = useForm<z.infer<typeof updateProfileSchema>>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            ...user,
            imageUrl: user.prefs?.avatar ?? "",
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name,
                imageUrl: user.prefs?.avatar || "",
            });
        }
    }, [user, form]);

    if (isLoading) {
        return <div>Loading...</div>;
    }



    const onSubmit = (values: z.infer<typeof updateProfileSchema>) => {

        const finalValues = {
            ...values,
            imageUrl: values.imageUrl instanceof File ? values.imageUrl : values.imageUrl || "no-image",
        };

        console.log("Final values:", finalValues);

        mutate({
            form: finalValues,
            param: { userId: user.$id }
        }, {
            onSuccess: () => {
                router.refresh();
            },
            onError: (error) => {
                toast.error("Failed to update profile");
            }
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("imageUrl", file);
        }
    };


    const openEmailModal = () => setIsEmailModalOpen(true);
    const closeEmailModal = () => setIsEmailModalOpen(false);

    const openPasswordModal = () => setIsPasswordModalOpen(true);
    const closePasswordModal = () => setIsPasswordModalOpen(false);

    const openDeleteModal = () => setIsDeleteModalOpen(true);
    const closeDeleteModal = () => setIsDeleteModalOpen(false);

    return (
        <Card className="flex justify-center w-full lg:max-w-screen-xl">
            <ChangeEmailForm
                isOpen={isEmailModalOpen}
                onClose={closeEmailModal}
                user={user}
            />

            <ChangePasswordForm
                isOpen={isPasswordModalOpen}
                onClose={closePasswordModal}
                user={user}
            />

            <DeleteUserForm
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                user={user}
            />

            <div className="w-full h-full flex items-center justify-center">
                <Card className="w-full shadow-lg border-none">
                    <CardHeader className="flex flex-row items-center gap-x-4 p-4 space-y-0">
                        <Button
                            size="sm"
                            variant="secondry"
                            onClick={() => router.push(`/workspaces/${workspaceId}`)}
                        >
                            <ArrowLeftIcon className="size-4 mr-1" />
                            Back
                        </Button>
                    </CardHeader>

                    <CardContent className="p-2">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="shrink-0 flex flex-col items-center gap-y-4 md:w-[180px]">
                                        <FormField
                                            control={form.control}
                                            name="imageUrl"
                                            render={({ field }) => (
                                                <div className="flex flex-col items-center gap-y-3 w-full">
                                                    {field.value ? (
                                                        <div className="size-32 relative rounded-full overflow-hidden border-4 border-gray-200">
                                                            <img
                                                                alt="Profile"
                                                                className="w-full h-full object-cover"
                                                                src={
                                                                    typeof field.value === "string"
                                                                        ? field.value
                                                                        : URL.createObjectURL(field.value as File)
                                                                }
                                                            />
                                                        </div>
                                                    ) : (
                                                        <Avatar className="size-32">
                                                            <AvatarFallback>
                                                                <ImageIcon className="size-12 text-neutral-400" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}

                                                    <input
                                                        className="hidden"
                                                        type="file"
                                                        accept=".jpg,.png,.jpeg"
                                                        ref={inputRef}
                                                        onChange={handleImageChange}
                                                        disabled={isPending}
                                                    />

                                                    {field.value ? (
                                                        <Button
                                                            type="button"
                                                            disabled={isPending}
                                                            variant="destructive"
                                                            size="sm"
                                                            className="w-full"
                                                            onClick={() => {
                                                                form.setValue("imageUrl", "");
                                                                if (inputRef.current) {
                                                                    inputRef.current.value = "";
                                                                }
                                                            }}
                                                        >
                                                            Remove Image
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            disabled={isPending}
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full"
                                                            onClick={() => inputRef.current?.click()}
                                                        >
                                                            Upload Image
                                                        </Button>
                                                    )}

                                                    <p className="text-xs text-muted-foreground text-center">
                                                        JPG, PNG, JPEG max 1mb
                                                    </p>
                                                </div>
                                            )}
                                        />
                                    </div>

                                    <div className="flex-1 flex flex-col gap-y-4">

                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Enter your name"
                                                            disabled={isPending}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex justify-end">
                                            <Button type="submit" size="sm" disabled={isPending}>
                                                <Save className="h-4 w-4 mr-2" />
                                                {isPending ? "Saving..." : "Save Changes"}
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Mail className="h-4 w-4 text-gray-500" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-700 truncate max-w-[150px] sm:max-w-xs">
                                                            {user.email}
                                                        </span>
                                                        <span className="text-xs text-gray-500">Email Address</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="xs"
                                                    onClick={() => setIsEmailModalOpen(true)}
                                                >
                                                    Change Email
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {new Date(user.$createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-xs text-gray-500">Joined Date</span>
                                                </div>
                                            </div>

                                            <div className="p-3 border rounded-lg">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full justify-start h-8"
                                                    onClick={() => setIsPasswordModalOpen(true)}
                                                >
                                                    Change Password
                                                </Button>
                                            </div>

                                            <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                                                <div className="flex flex-col gap-2">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-red-600">Danger Zone</h3>
                                                        <p className="text-sm text-red-600 mt-1">
                                                            Deleting your account is irreversible and will remove all data.
                                                        </p>
                                                    </div>
                                                    <Button
                                                        className="w-fit ml-auto"
                                                        size="default"
                                                        variant="destructive"
                                                        type="button"
                                                        onClick={() => setIsDeleteModalOpen(true)}
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-2" />
                                                        Delete Account
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </Card>
    );
};