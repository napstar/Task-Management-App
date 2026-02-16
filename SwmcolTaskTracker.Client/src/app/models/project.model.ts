export interface Project {
    projectId: number;
    projectName: string;
    description?: string;
    isActive: boolean;
    projectLeadAdOid?: string;
    createdAt?: Date;
}
