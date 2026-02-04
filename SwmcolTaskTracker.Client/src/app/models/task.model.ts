export interface TaskDependency {
    dependencyId: number;
    taskId: number;
    userAdOid: string;
    userDisplayName?: string;
    userEmail?: string;
}

export interface TaskComment {
    commentId: number;
    taskId: number;
    commentText: string;
    authorAdOid: string;
    createdTimestamp: Date; // Has default in SQL, likely always present on read
}

export interface Task {
    taskId: number;
    title: string;
    description?: string;
    status: string; // Could be union type 'ToDo' | 'InProgress' | 'Completed' if strict
    projectName?: string;
    createdByAdOid: string;
    startDate?: Date;
    dueDate?: Date;
    completedDate?: Date;
    projectId?: number;
    createdAt: Date; // Has default in SQL, likely always present on read

    // Nested properties not in SQL table
    dependencies?: TaskDependency[];
    comments?: TaskComment[];
}
