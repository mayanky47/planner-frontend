import React, { useMemo } from 'react';
import type { Task, TaskStatus } from '../types';
import { getPriorityClasses } from '../utils/UtilsAndHooks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faCheckCircle, faTrash, faGripVertical } from '@fortawesome/free-solid-svg-icons';

// --- Task Card Component ---

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
    onViewHistory: (task: Task) => void;
    onMarkComplete: (taskId: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onViewHistory, onMarkComplete }) => {
    const priorityClasses = getPriorityClasses(task.priority);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('text/plain', task.id.toString());
        e.currentTarget.classList.add('opacity-40', 'shadow-2xl');
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('opacity-40', 'shadow-2xl');
    };

    const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
        e.stopPropagation(); // Prevent card's onClick from firing
        action();
    };

    return (
        <div
            onClick={() => onEdit(task)}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="group relative cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-indigo-300"
        >
            <div className="flex items-start justify-between">
                <h4 className="font-semibold text-slate-800">{task.title}</h4>
                <span className={`ml-2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityClasses}`}>
                    {task.priority}
                </span>
            </div>
            <p className="mb-3 mt-1 text-sm text-slate-600 line-clamp-2">{task.description}</p>
            <div className="mb-3 text-xs text-slate-500">
                Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
            
            {/* Action Buttons Footer */}
            <div className="flex items-center justify-end space-x-1 border-t border-slate-100 pt-2 text-slate-400">
                <button
                    onClick={(e) => handleButtonClick(e, () => onViewHistory(task))}
                    className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-100 hover:text-indigo-600"
                    title="View History"
                >
                    <FontAwesomeIcon icon={faHistory} />
                </button>
                <button
                    onClick={(e) => handleButtonClick(e, () => onMarkComplete(task.id))}
                    className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-100 hover:text-green-600"
                    title="Mark as Completed"
                >
                    <FontAwesomeIcon icon={faCheckCircle} />
                </button>
                <button
                    onClick={(e) => handleButtonClick(e, () => { if (window.confirm(`Delete task '${task.title}'?`)) onDelete(task.id); })}
                    className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-slate-100 hover:text-red-600"
                    title="Delete Task"
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </div>
            {/* Drag handle visible on hover */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-slate-300 opacity-0 transition group-hover:opacity-100">
                 <FontAwesomeIcon icon={faGripVertical} />
            </div>
        </div>
    );
};

// --- Kanban Column Component ---

interface TaskColumnProps {
    title: string;
    status: TaskStatus;
    tasks: Task[];
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
    onViewHistory: (task: Task) => void;
    onMoveTask: (taskId: number, newStatus: TaskStatus) => void;
    onMarkComplete: (taskId: number) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({ title, status, tasks, onEdit, onDelete, onViewHistory, onMoveTask, onMarkComplete }) => {
    
    const statusMetadata = useMemo(() => {
        switch (status) {
            case 'TO_DO': return { dot: 'bg-slate-400', text: 'text-slate-600' };
            case 'IN_PROGRESS': return { dot: 'bg-yellow-500', text: 'text-yellow-700' };
            case 'REVIEW': return { dot: 'bg-blue-500', text: 'text-blue-700' };
            default: return { dot: 'bg-slate-400', text: 'text-slate-600' };
        }
    }, [status]);
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-indigo-50/50', 'border-indigo-400');
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('bg-indigo-50/50', 'border-indigo-400');
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-indigo-50/50', 'border-indigo-400');
        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId) {
            onMoveTask(parseInt(taskId), status);
        }
    };

    return (
        <div
            className="flex h-full flex-col rounded-xl border-2 border-dashed border-transparent bg-slate-100 p-3 transition-colors"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Column Header */}
            <header className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${statusMetadata.dot}`} />
                    <h4 className={`text-lg font-bold ${statusMetadata.text}`}>{title}</h4>
                </div>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {tasks.length}
                </span>
            </header>
            
            {/* Task Cards Container */}
            <div className="flex min-h-[150px] flex-grow flex-col space-y-3 overflow-y-auto">
                {tasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onViewHistory={onViewHistory}
                        onMarkComplete={onMarkComplete}
                    />
                ))}
                {tasks.length === 0 && (
                    <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-100 p-4">
                        <p className="text-center text-sm text-slate-500">Drop tasks here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
