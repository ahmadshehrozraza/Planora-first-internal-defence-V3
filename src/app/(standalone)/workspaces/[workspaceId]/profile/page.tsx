

import { redirect } from "next/navigation";
import { getCurrent } from "@/features/auth/queries";
import { UserProfileForm } from "@/features/auth/components/user-profile-form";

const UserProfilePage = async () => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");

    return (
        <div className="w-full overflow-x-hidden h-full flex items-center justify-center flex-col">
                <UserProfileForm />
        </div>
    );
}

export default UserProfilePage;