// --- Project Interfaces ---

export interface Project {
    id: number;
    name: string;
    description: string;
    startDate: string; // ISO Date String
    endDate: string; // ISO Date String
    status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
    createdAt: string;
    // consolidated plan content
    strategyPlan: string;
    markdownPlan?: string;
    parentProjectId?: number | null; // ID of the parent project
    childProjects?: Project[];     // A list of nested child project objects
}

// --- Task Interfaces ---

export type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    projectId: number;
    createdAt: string;
    updatedAt: string;
}

export interface TaskVersionHistory {
    id: number;
    taskId: number;
    versionTimestamp: string;
    oldTitle: string;
    oldDescription: string;
    oldStatus: string;
    changeSummary: string;
}

// --- Strategy History Interfaces ---

export interface ProjectStrategyVersion {
    versionId: number;
    projectId: number;
    versionTimestamp: string;
    oldGoal: string; // Retained for showing historical data
    oldStrategyPlan: string;
    changeSummary: string;
}
