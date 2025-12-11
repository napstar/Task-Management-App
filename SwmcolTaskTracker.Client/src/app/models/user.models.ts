export interface AppRole {
    roleId: number;
    roleName: string;
    description: string;
}

export interface UserRoleAssignment {
    assignmentId: number;
    userAdOid: string;
    roleId: number;
    roleName?: string; // Optional, strictly for UI convenience
}
