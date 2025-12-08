import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation";
import { ProjectIdSettingsClient } from "./client";



const ProjectIdSettingsPage = async () => {
    const user = await getCurrent();
    if(!user) redirect("/sign-in");


    return ( 
        <div className="w-full">
            <ProjectIdSettingsClient />
        </div>
     );
}
 
export default ProjectIdSettingsPage;