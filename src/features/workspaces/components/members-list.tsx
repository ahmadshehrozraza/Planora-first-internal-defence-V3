"use client";

import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/api/use-get-members";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ArrowLeftIcon, MoreVerticalIcon, Crown, User, Mail, Shield, Trash2, UserCog, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Fragment, useState, useMemo } from "react";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useDeleteMember } from "@/features/members/api/use-delete-member";
import { useUpdateMember } from "@/features/members/api/use-update-member";
import { MemberRole } from "@/features/members/types";
import { useConfirm } from "@/hooks/use-confirm";
import { PageLoader } from "@/components/page-loader";

export const MembersList = () => {
    const workspaceId = useWorkspaceId();
    const [ConfirmDialog, confirm] = useConfirm(
        "Remove member",
        "This member will be removed from the workspace",
        "destructive"
    );

    const [memberToDelete, setMemberToDelete] = useState<{id: string, name: string} | null>(null);

    if (!workspaceId) {
        return <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading workspace...</p>
            </div>
        </div>;
    }

    const { data, isLoading } = useGetMembers({ workspaceId });
    const { mutate: deleteMember, isPending: isDeletingMember } = useDeleteMember();
    const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember();

    // Calculate admin count
    const adminCount = useMemo(() => {
        if (!data?.documents) return 0;
        return data.documents.filter(member => member.role === MemberRole.ADMIN).length;
    }, [data]);

    const handleUpdateMember = (memberId: string, role: MemberRole) => {
        updateMember({
            json: { role },
            param: { memberId },
        });
    };

    const handleDeleteMember = async (memberId: string, memberName: string) => {
        setMemberToDelete({ id: memberId, name: memberName });
        
        const ok = await confirm();
        if (!ok) {
            setMemberToDelete(null);
            return;
        }

        deleteMember({ param: { memberId } }, {
            onSuccess: () => {
                setMemberToDelete(null);
                window.location.reload();
            },
            onError: () => {
                setMemberToDelete(null);
            }
        });
    };

    // Check if user is the only admin
    const isOnlyAdmin = (memberId: string, memberRole: MemberRole) => {
        if (memberRole !== MemberRole.ADMIN) return false;
        return adminCount === 1;
    };

    if (isLoading) {
        return <PageLoader />
    }

    if (!data?.documents?.length) {
        return (
            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="p-7">
                    <CardTitle className="text-xl font-bold">Members List</CardTitle>
                </CardHeader>
                <CardContent className="p-7">
                    <div className="text-center py-12">
                        <div className="mx-auto size-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <User className="size-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No members found</h3>
                        <p className="text-gray-500 text-sm">Invite members to collaborate on this workspace</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full h-full border shadow-sm rounded-xl">
            <ConfirmDialog />
            <CardHeader className="p-7 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-gray-800">
                        Members ({data.total})
                    </CardTitle>
                    <div className="flex items-center gap-x-4">
                        <div className="flex items-center gap-x-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                            <Crown className="size-4 text-purple-600" />
                            <span className="text-sm font-medium text-gray-700">
                                {adminCount} {adminCount === 1 ? 'Admin' : 'Admins'}
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            
            <div className="px-7">
                <Separator />
            </div>
            
            <CardContent className="p-7">
                <div className="space-y-4">
                    {data.documents.map((member, index) => {
                        const onlyAdmin = isOnlyAdmin(member.$id, member.role);
                        
                        return (
                            <Fragment key={member.$id}>
                                <div className="flex items-center gap-4 p-4 bg-white rounded-xl border hover:bg-gray-50 transition-all duration-200 group">
                                    <MemberAvatar
                                        className="size-12 border-2 border-white shadow-sm"
                                        fallbackClassname="text-base font-semibold"
                                        name={member.name}
                                        src={member?.memberImage}
                                    />
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <p className="text-base font-semibold text-gray-900 truncate">
                                                {member.name}
                                            </p>

                                            <div className={`inline-flex items-center gap-x-1.5 px-3 py-1 rounded-full text-xs font-medium ${member.role === "ADMIN"
                                                ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200"
                                                : "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200"
                                                }`}>
                                                {member.role === "ADMIN" ? (
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

                                            {onlyAdmin && (
                                                <div className="inline-flex items-center gap-x-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-xs">
                                                    <AlertCircle className="size-3" />
                                                    <span className="font-medium">Only Admin</span>
                                                </div>
                                            )}

                                        </div>
                                        
                                        <div className="flex items-center gap-x-2 text-sm text-gray-600">
                                            <Mail className="size-3.5" />
                                            <span className="truncate">{member.email}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    className="ml-auto"
                                                    variant="ghost"
                                                    size="icon"
                                                    
                                                >
                                                    <MoreVerticalIcon className="size-5 text-gray-500" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent 
                                                side="bottom" 
                                                align="end" 
                                                className="w-56 border shadow-lg rounded-xl"
                                            >
                                                
                                                <DropdownMenuItem
                                                    className={`px-3 py-2.5 cursor-pointer ${member.role === MemberRole.ADMIN ? 'bg-purple-50 text-purple-700' : 'hover:bg-gray-50'}`}
                                                    onClick={() => handleUpdateMember(member.$id, MemberRole.ADMIN)}
                                                    disabled={isUpdatingMember || member.role === MemberRole.ADMIN || onlyAdmin}
                                                >
                                                    <Crown className="size-4 mr-2.5" />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">Set as Administrator</span>
                                                    </div>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    className={`px-3 py-2.5 cursor-pointer ${member.role === MemberRole.MEMBER ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}
                                                    onClick={() => handleUpdateMember(member.$id, MemberRole.MEMBER)}
                                                    disabled={isUpdatingMember || member.role === MemberRole.MEMBER || onlyAdmin}
                                                >
                                                    <User className="size-4 mr-2.5" />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">Set as Member</span>
                                                    </div>
                                                </DropdownMenuItem>
                                                
                                                <Separator className="my-1" />
                                                
                                                <DropdownMenuItem
                                                    className={`px-3 py-2.5 cursor-pointer ${onlyAdmin 
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                        : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                                                    }`}
                                                    onClick={() => !onlyAdmin && handleDeleteMember(member.$id, member.name)}
                                                    disabled={isDeletingMember || onlyAdmin}
                                                >
                                                    <Trash2 className="size-4 mr-2.5" />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            Remove {member.name.split(' ')[0]}
                                                        </span>
                                                        <span className="text-xs">
                                                            {onlyAdmin ? "Cannot delete the only admin" : "Remove from workspace"}
                                                        </span>
                                                    </div>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                
                                {index < data.documents.length - 1 && (
                                    <Separator className="my-1 opacity-30" />
                                )}
                            </Fragment>
                        );
                    })}
                </div>
                
                {/* Stats footer */}
                <div className="mt-2 pt-2 border-t">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        {adminCount === 1 && (
                            <div className="flex items-center gap-x-1 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                                <AlertCircle className="size-4" />
                                <span className="text-sm font-medium">At least 1 admin required</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};