import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { Project, Task, TaskStatus } from '../types';
import { makeApiCall, API_BASE_URL } from '../utils/UtilsAndHooks';
import { TaskForm } from '../components/Forms';
import { TaskHistoryModal, ProjectStrategyHistoryModal } from '../components/Modals';
import ProjectStrategy from '../components/ProjectStrategy';
import { MarkdownEditor } from '../components/MarkdownEditor';
import { TaskColumn } from '../components/KanbanComponents';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faArrowLeft, faPlus, faListCheck, faExclamationTriangle, 
    faCalendarDay, faSitemap, faEdit, faTrash, faCalendarAlt 
} from '@fortawesome/free-solid-svg-icons';

// --- Re-integrated ProjectCard for displaying children ---
interface ProjectCardProps {
    project: Project;
    onSelectProject: (id: number) => void;
    onEditProject: (project: Partial<Project>) => void;
    onDeleteProject: (id: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelectProject, onEditProject, onDeleteProject }) => {
    // ... (Component code is correct)
    const getStatusClasses = (status: Project['status']) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800 ring-1 ring-inset ring-green-200';
            case 'DRAFT': return 'bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-200';
            case 'COMPLETED': return 'bg-indigo-100 text-indigo-800 ring-1 ring-inset ring-indigo-200';
            case 'ABANDONED': return 'bg-red-100 text-red-800 ring-1 ring-inset ring-red-200';
            default: return 'bg-slate-100 text-slate-800 ring-1 ring-inset ring-slate-200';
        }
    };
    const handleActionClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    };
    return (
        <div onClick={() => onSelectProject(project.id)} className="group flex cursor-pointer flex-col rounded-xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <div className="flex items-start justify-between border-b border-slate-100 p-4">
                <h3 className="text-lg font-bold text-slate-800">{project.name}</h3>
                <span className={`ml-3 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusClasses(project.status)}`}>{(project.status?.replace('_', ' ') ?? 'NO STATUS')}</span>
            </div>
            <div className="flex flex-grow flex-col p-4">
                <p className="mb-4 flex-grow text-sm text-slate-600 line-clamp-3">{project.description}</p>
                {project.childProjects && project.childProjects.length > 0 && (
                    <div className="mb-3 flex items-center text-xs text-slate-500">
                        <FontAwesomeIcon icon={faSitemap} className="mr-2 text-slate-400" />
                        {project.childProjects.length} sub-project(s)
                    </div>
                )}
                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-slate-400" />
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
            <div className="mt-auto flex justify-end space-x-1 border-t border-slate-100 p-2">
                <button onClick={(e) => handleActionClick(e, () => onEditProject(project))} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600" title="Edit Project Details"><FontAwesomeIcon icon={faEdit} /></button>
                <button onClick={(e) => handleActionClick(e, () => { if (window.confirm(`Delete project '${project.name}'?`)) onDeleteProject(project.id) })} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600" title="Delete Project"><FontAwesomeIcon icon={faTrash} /></button>
            </div>
        </div>
    );
};

// --- Extracted Sub-Components for Readability ---

interface ProjectDetailHeaderProps {
  onBack: () => void;
  projectName: string;
  onAddTask: () => void;
}

const ProjectDetailHeader: React.FC<ProjectDetailHeaderProps> = React.memo(({ onBack, projectName, onAddTask }) => (
    <header className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
        <button onClick={onBack} className="group flex items-center gap-x-2 text-sm font-semibold text-slate-600 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            <FontAwesomeIcon icon={faArrowLeft} className="transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
        </button>
        <h1 className="truncate px-4 text-center text-2xl font-bold text-slate-800 sm:text-3xl">{projectName}</h1>
        <button onClick={onAddTask} className="flex items-center gap-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
            <FontAwesomeIcon icon={faPlus} />
            <span className="hidden sm:inline">Add Task</span>
        </button>
    </header>
));

interface ProjectStatsGridProps {
  progress: number;
  completedTasks: number;
  totalTasks: number;
  overdueTasks: number;
  daysRemaining: string | null;
}

const ProjectStatsGrid: React.FC<ProjectStatsGridProps> = React.memo(({ progress, completedTasks, totalTasks, overdueTasks, daysRemaining }) => (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Progress */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-md">
            <h4 className="truncate text-sm font-medium text-slate-500">Progress</h4>
            <p className="mt-1 text-3xl font-semibold text-slate-800">{progress}%</p>
            <div className="mt-2 h-2.5 w-full rounded-full bg-slate-200">
                <div className="h-2.5 rounded-full bg-indigo-600" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
        {/* Card 2: Tasks */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-md">
            <div className="flex items-center gap-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600"><FontAwesomeIcon icon={faListCheck} /></div>
                <div>
                    <h4 className="truncate text-sm font-medium text-slate-500">Tasks Completed</h4>
                    <p className="mt-1 text-2xl font-semibold text-slate-800">{completedTasks} / {totalTasks}</p>
                </div>
            </div>
        </div>
        {/* Card 3: Overdue */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-md">
            <div className="flex items-center gap-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600"><FontAwesomeIcon icon={faExclamationTriangle} /></div>
                <div>
                    <h4 className="truncate text-sm font-medium text-slate-500">Overdue Tasks</h4>
                    <p className="mt-1 text-2xl font-semibold text-slate-800">{overdueTasks}</p>
                </div>
            </div>
        </div>
        {/* Card 4: Due Date */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-md">
            <div className="flex items-center gap-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600"><FontAwesomeIcon icon={faCalendarDay} /></div>
                <div>
                    <h4 className="truncate text-sm font-medium text-slate-500">Due Date</h4>
                    <p className="mt-1 text-lg font-semibold text-slate-800">{daysRemaining || 'Not set'}</p>
                </div>
            </div>
        </div>
    </div>
));

interface ChildProjectsSectionProps {
  childProjects: Project[];
  onSelectProject: (id: number) => void;
  onEditProject: (project: Partial<Project>) => void;
  onDeleteProject: (id: number) => void;
  onAddChildProject: () => void;
}

const ChildProjectsSection: React.FC<ChildProjectsSectionProps> = React.memo(({ childProjects, onSelectProject, onEditProject, onDeleteProject, onAddChildProject }) => (
    <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-md border border-slate-200">
        <h2 className="mb-4 flex items-center gap-x-3 border-b border-slate-200 pb-2 text-2xl font-semibold text-slate-700">
            <FontAwesomeIcon icon={faSitemap} className="text-slate-400" />
            Sub-Projects ({childProjects?.length || 0})
        </h2>
        {childProjects && childProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {childProjects.map(child => (
                    <ProjectCard key={child.id} project={child} onSelectProject={onSelectProject} onEditProject={onEditProject} onDeleteProject={onDeleteProject} />
                ))}
            </div>
        ) : (
            <p className="py-4 text-center text-sm italic text-slate-500">No sub-projects have been added yet.</p>
        )}
        <div className="mt-6 border-t border-slate-200 pt-4 text-center">
            <button onClick={onAddChildProject} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
                + Add Sub-Project
            </button>
        </div>
    </div>
));

const DISPLAYED_STATUSES: TaskStatus[] = ['TO_DO', 'IN_PROGRESS', 'REVIEW'];

type TaskBoardTasks = Record<'TO_DO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED', Task[]>;

interface TaskBoardSectionProps {
  isLoading: boolean;
  tasksByStatus: TaskBoardTasks;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onViewHistory: (task: Task) => void;
  onMoveTask: (taskId: number, newStatus: TaskStatus) => void;
  onMarkComplete: (id: number) => void;
}

const TaskBoardSection: React.FC<TaskBoardSectionProps> = React.memo(({ isLoading, tasksByStatus, onEdit, onDelete, onViewHistory, onMoveTask, onMarkComplete }) => (
    <div className="rounded-2xl bg-slate-100 p-4 sm:p-6">
        <h2 className="mb-4 border-b border-slate-200 pb-2 text-2xl font-semibold text-slate-700">Task Board</h2>
        {isLoading ? <p className="text-slate-500">Loading tasks...</p> : 
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {DISPLAYED_STATUSES.map((status) => (
                <TaskColumn 
                    key={status} 
                    title={status.replace('_', ' ')} 
                    status={status} 
                    tasks={tasksByStatus[status]} 
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                    onViewHistory={onViewHistory} 
                    onMoveTask={onMoveTask} 
                    onMarkComplete={onMarkComplete} 
                />
            ))}
        </div>
        }
        <p className="mt-4 text-sm text-slate-500">Note: 'Completed' tasks are hidden from the board to maintain focus.</p>
    </div>
));


// --- Main ProjectDetailView Component ---

interface ProjectDetailViewProps {
    project: Project; // This is the 'initialProject'
    onBack: () => void;
    onSelectProject: (id: number) => void;
    onEditProject: (project: Partial<Project>) => void;
    onDeleteProject: (id: number) => void;
}

type ProjectSavePayload = Partial<Omit<Project, 'parentProject'>> & {
  parentProject?: { id: number };
};


const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project: initialProject, onBack, onSelectProject, onEditProject, onDeleteProject }) => {
    
    // --- State ---
    const [project, setProject] = useState<Project>(initialProject);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isTasksLoading, setIsTasksLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [historyTask, setHistoryTask] = useState<Task | null>(null);
    const [showStrategyHistory, setShowStrategyHistory] = useState(false);

    // --- NEW: Sync prop changes to local state ---
    // This handles navigating from one project detail view to another
    useEffect(() => {
        setProject(initialProject);
    }, [initialProject]);


    // --- Data Fetching (Memoized) ---
    const fetchProject = useCallback(async () => {
        if (!project.id) return;
        try {
            const updatedProject = await makeApiCall(`${API_BASE_URL}/projects/${project.id}`, { method: 'GET' });
            if (updatedProject) {
                setProject(updatedProject); // Update local state
            }
        } catch (e) {
            console.error("Failed to re-fetch project:", e);
            setError("Failed to refresh project data after save.");
        }
    }, [project.id]); // Depends on the *current* project ID in state

    const fetchTasks = useCallback(async () => {
        if (!project.id) return;
        setIsTasksLoading(true);
        try {
            const tasksData = await makeApiCall(`${API_BASE_URL}/projects/${project.id}/tasks`, { method: 'GET' });
            const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
            const sortedTasks = (tasksData || []).sort((a: Task, b: Task) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            setTasks(sortedTasks);
            setError(null);
        } catch (e) {
            console.error("Failed to fetch tasks:", e);
            setError('Failed to load tasks.');
        } finally {
            setIsTasksLoading(false);
        }
    }, [project.id]); // Now depends on 'project.id' from state


    // --- Event Handlers (All Memoized) ---
    const onAddChildProject = useCallback(() => {
        onEditProject({ parentProjectId: project.id });
    }, [onEditProject, project.id]);

    const handleSaveProjectDetails = useCallback(async (projectData: Partial<Project>): Promise<Project | null> => {
        try {
            const payload: ProjectSavePayload = { ...projectData };
            
            if (project?.parentProjectId && !payload.parentProject) {
                payload.parentProject = { id: project.parentProjectId };
            }
            if (payload.parentProject && payload.parentProjectId) {
                delete payload.parentProjectId;
            }
            
            const savedProject = await makeApiCall(`${API_BASE_URL}/projects/${project.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            // RE-FETCH THE FULL PROJECT (GET request)
            await fetchProject();

            return savedProject;
        } catch (err) {
            setError(`Failed to save project details. Update failed.`);
            return null;
        }
    }, [project, fetchProject]); // Depends on project state and the memoized fetchProject

const handleSaveMarkdown = useCallback(async (markdownContent: string) => {
    // Await the save, but don't return its value.
    // This makes the function's return type Promise<void>
    await handleSaveProjectDetails({ markdownPlan: markdownContent });
}, [handleSaveProjectDetails]);

    const handleSaveTask = useCallback(async (taskData: Partial<Task>) => {
        const isUpdate = !!taskData.id;
        const url = isUpdate ? `${API_BASE_URL}/tasks/${taskData.id}` : `${API_BASE_URL}/tasks`;
        const method = isUpdate ? 'PUT' : 'POST';
        const payload = { ...taskData, project: { id: project.id } };
        try {
            const savedTask = await makeApiCall(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (savedTask) {
                fetchTasks();
                setShowTaskForm(false);
                setTaskToEdit(null);
            }
            return savedTask;
        } catch (e) {
            setError('Failed to save task.');
            return null;
        }
    }, [project.id, fetchTasks]); // Depends on project state and memoized fetchTasks

    const handleDeleteTask = useCallback(async (id: number) => {
        try {
            await makeApiCall(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' });
            fetchTasks(); 
        } catch (e) {
            setError('Failed to delete task.');
        }
    }, [fetchTasks]); // Depends on memoized fetchTasks

    const handleMoveTask = useCallback(async (taskId: number, newStatus: TaskStatus) => {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            const oldStatus = task.status;
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
            
            const savedTask = await handleSaveTask({ ...task, status: newStatus });
            
            if (!savedTask) {
                setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: oldStatus } : t));
                setError(`Failed to move task. Status reverted.`);
            }
        }
    }, [tasks, handleSaveTask]); // Depends on tasks state and memoized save handler

    const handleMarkComplete = useCallback((taskId: number) => {
        if (window.confirm("Mark this task as COMPLETED?")) {
            handleMoveTask(taskId, 'COMPLETED');
        }
    }, [handleMoveTask]); // Depends on memoized move handler

    // Simple state setters are stable, so empty dependency arrays are fine
    const handleEditTask = useCallback((task: Task) => { 
        setTaskToEdit(task); 
        setShowTaskForm(true); 
    }, []);

    const handleViewHistory = useCallback((task: Task) => { 
        setHistoryTask(task); 
    }, []);

    const handleAddTask = useCallback(() => { 
        setTaskToEdit(null); 
        setShowTaskForm(true); 
    }, []);


    // --- Effects ---
    // Fetches tasks when the project.id (from state) or fetchTasks function changes
    useEffect(() => {
        if (project.id) {
            fetchTasks();
        }
    }, [project.id, fetchTasks]);


    // --- Memoized Calculations ---
    const projectStats = useMemo(() => {
        const totalTasks = tasks.length;
        if (totalTasks === 0) return { totalTasks: 0, completedTasks: 0, progress: 0, overdueTasks: 0 };
        const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
        const progress = Math.round((completedTasks / totalTasks) * 100);
        const overdueTasks = tasks.filter(t => t.status !== 'COMPLETED' && new Date(t.dueDate) < new Date()).length;
        return { totalTasks, completedTasks, progress, overdueTasks };
    }, [tasks]);

    const daysRemaining = useMemo(() => {
        if (!project?.endDate) return null;
        const endDate = new Date(project.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffTime = endDate.getTime() - today.getTime();
        if (diffTime < 0) return "Past Due";
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} days remaining`;
    }, [project?.endDate]); // Uses local project state

    const tasksByStatus = useMemo((): TaskBoardTasks => { 
        const groups: Partial<Record<TaskStatus, Task[]>> = {};
        tasks.forEach(task => {
            groups[task.status] = groups[task.status] || [];
            groups[task.status]!.push(task);
        });
        
        return {
            TO_DO: groups.TO_DO || [],
            IN_PROGRESS: groups.IN_PROGRESS || [],
            REVIEW: groups.REVIEW || [],
            COMPLETED: groups.COMPLETED || []
        };
    }, [tasks]);


    // --- Render ---
    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
                
                <ProjectDetailHeader 
                    onBack={onBack}
                    projectName={project.name} // Uses local state
                    onAddTask={handleAddTask}  // Uses memoized handler
                />

                <main>
                    {project.parentProjectId && ( // Uses local state
                        <div className="mb-6">
                            <button onClick={() => onSelectProject(project.parentProjectId!)} className="text-sm font-semibold text-indigo-600 hover:underline">
                                &larr; Back to Parent Project
                            </button>
                        </div>
                    )}
                    <p className="mx-auto mb-10 max-w-4xl text-center text-slate-600">{project.description}</p> {/* Uses local state */}
                    {error && <div className="mb-6 rounded-lg bg-red-100 p-4 text-sm text-red-800">{error}</div>}

                    <div className="space-y-8">
                        
                        <ProjectStatsGrid
                            progress={projectStats.progress}
                            completedTasks={projectStats.completedTasks}
                            totalTasks={projectStats.totalTasks}
                            overdueTasks={projectStats.overdueTasks}
                            daysRemaining={daysRemaining}
                        />

                        <ProjectStrategy 
                            project={project} // Uses local state
                            onSaveProject={handleSaveProjectDetails} // Uses memoized handler
                            onOpenHistory={() => setShowStrategyHistory(true)} 
                        />
                        
                        <MarkdownEditor 
        key={project.markdownPlan} // <-- Add this
        content={project.markdownPlan} 
        onSave={handleSaveMarkdown} 
    />
                        <ChildProjectsSection
                            childProjects={project.childProjects || []} // Uses local state
                            onSelectProject={onSelectProject}
                            onEditProject={onEditProject}
                            onDeleteProject={onDeleteProject}
                            onAddChildProject={onAddChildProject} // Uses memoized handler
                        />
                        
                        <TaskBoardSection
                            isLoading={isTasksLoading}
                            tasksByStatus={tasksByStatus}
                            onEdit={handleEditTask}         // Uses memoized handler
                            onDelete={handleDeleteTask}     // Uses memoized handler
                            onViewHistory={handleViewHistory} // Uses memoized handler
                            onMoveTask={handleMoveTask}       // Uses memoized handler
                            onMarkComplete={handleMarkComplete} // Uses memoized handler
                        />
                    </div>
                </main>
            </div>
            
            {/* --- Modals --- */}
            {showTaskForm && (
                <TaskForm
                    task={taskToEdit}
                    projectId={project.id} // Uses local state
                    onSave={handleSaveTask}  // Uses memoized handler
                    onCancel={() => { setShowTaskForm(false); setTaskToEdit(null); }}
                />
            )}
            
            {historyTask && (
                <TaskHistoryModal
                    taskId={historyTask.id}
                    taskTitle={historyTask.title}
                    onClose={() => setHistoryTask(null)}
                    show={!!historyTask} // Correctly uses state
                />
            )}
            
            {project && showStrategyHistory && (
                <ProjectStrategyHistoryModal
                    project={project} // Uses local state
                    onClose={() => setShowStrategyHistory(false)}
                    show={showStrategyHistory} // Correctly uses state
                />
            )}
        </div>
    );
};

export default ProjectDetailView;