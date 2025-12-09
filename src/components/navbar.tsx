"use client";

import { usePathname } from "next/navigation";
import { UserButton } from "@/features/auth/components/user-button";
import { MobileSidebar } from "./mobile-sidebar";
import { useCurrentMember } from "@/features/members/hooks/current-user-role";
import { Crown, User } from "lucide-react";

const pathnameMap = {
    "tasks": {
        title: "My Tasks",
        description: "View all of your tasks here",
    },

    "projects": {
        title: "My Projects",
        description: "View all of your projects here",
    },

    "members": {
        title: "Members",
        description: "View all of your members here",
    },

    "settings": {
        title: "Workspace Settings",
        description: "Manage your workspace here",
    },

    "profile": {
        title: "Profile Settings",
        description: "Manage your profile here",
    },
}

const defaultMap = {
    title: "Home",
    description: "Moniter all of your projects and tasks here",
}

export const Navbar = () => {
    const pathname = usePathname();
    const pathnameParts = pathname.split("/");
    const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

    const { role } = useCurrentMember();

    const { title, description } = pathnameMap[pathnameKey] || defaultMap;

    return (
        <nav className="pt-4 px-6 flex items-center justify-between">
            <div className="flex-col hidden lg:flex">
                <h1 className="text-2xl font-semibold">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>
            {title === "Profile Settings" ? null :
                <div className="flex gap-x-4 items-center">
                    <div className={`inline-flex items-center gap-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${role === "ADMIN"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                        {role === "ADMIN" ? (
                            <>
                                <Crown className="size-4" />
                                <span className="font-semibold">Admin</span>
                            </>
                        ) : (
                            <>
                                <User className="size-4" />
                                <span className="font-semibold">Member</span>
                            </>
                        )}
                    </div>

                    <UserButton />
                </div>
            }
            <MobileSidebar />
        </nav>
    );
};