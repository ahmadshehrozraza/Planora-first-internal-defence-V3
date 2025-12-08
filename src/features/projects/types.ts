

import { Models } from "node-appwrite";

export enum projectStatus {
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
};

export type Project = Models.Document & {
    name: string;
    imageUrl: string;
    workspaceId: string;
    projectStatus: projectStatus;
};

