import React, { useState, useEffect } from 'react';
import type { Project, Task, TaskStatus, TaskPriority } from '../types';
import { TASK_STATUSES, TASK_PRIORITIES } from '../utils/UtilsAndHooks';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

// --- Project Creation/Edit Form ---
interface ProjectFormProps {
    project: Partial<Project> | null;
    onSave: (data: Partial<Project>) => void;
    onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Project>>({});

    useEffect(() => {
        const initialData: Partial<Project> = {
            name: '', 
            description: '', 
            startDate: new Date().toISOString().split('T')[0], 
            endDate: '', 
            status: 'DRAFT' as Project['status'],
            ...project,
        };
        setFormData(initialData);
    }, [project]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // --- FIX: Transform the data to match the backend's expected structure ---
        const payload: any = { ...formData };

        // If a parentProjectId exists, it means we are creating a child project.
        // We need to shape this into the { parentProject: { id: ... } } object.
        if (formData.parentProjectId) {
            payload.parentProject = { id: formData.parentProjectId };
            delete payload.parentProjectId; // Clean up the flat property
        }
        
        onSave(payload);
    };

    const getTitle = () => {
        if (project?.id) return 'Edit Project';
        if (project?.parentProjectId) return 'Create New Sub-Project';
        return 'Create New Project';
    };

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/70 p-4 pt-10 backdrop-blur-sm">
                <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
                    <header className="flex items-center justify-between border-b border-slate-200 p-6">
                        <h2 className="text-2xl font-bold text-slate-800">{getTitle()}</h2>
                        <button onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"><FontAwesomeIcon icon={faTimes} /></button>
                    </header>
                    <form onSubmit={handleSubmit} className="space-y-4 p-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Name</label>
                            <input name="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm resize-none focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Start Date</label>
                                <input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">End Date</label>
                                <input type="date" name="endDate" value={formData.endDate || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Status</label>
                            <select name="status" value={formData.status || 'DRAFT'} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                <option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="COMPLETED">Completed</option><option value="ABANDONED">Abandoned</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={onCancel} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">Cancel</button>
                            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                                {project?.id ? 'Update Project' : 'Create Project'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// --- Task Creation/Edit Form (Modernized) ---
interface TaskFormProps {
    task: Partial<Task> | null;
    projectId: number;
    onSave: (data: Partial<Task>) => void;
    onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, projectId, onSave, onCancel }) => {
    const isEdit = !!task?.id;
    const today = new Date().toISOString().split('T')[0];

    const [formData, setFormData] = useState<Partial<Task>>({});

    useEffect(() => {
        setFormData({
            title: '', description: '', dueDate: today, priority: 'MEDIUM' as Task['priority'], status: 'TO_DO' as Task['status'], projectId, ...task,
        } as Partial<Task>);
    }, [task, projectId, today]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/70 p-4 pt-10 backdrop-blur-sm">
                <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
                    <header className="flex items-center justify-between border-b border-slate-200 p-6">
                        <h2 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Task' : 'Create New Task'}</h2>
                        <button onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"><FontAwesomeIcon icon={faTimes} /></button>
                    </header>
                    <form onSubmit={handleSubmit} className="space-y-4 p-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Title</label>
                            <input name="title" value={formData.title || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm resize-none focus:border-indigo-500 focus:ring-indigo-500" />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Due Date</label>
                                <input type="date" name="dueDate" value={formData.dueDate || ''} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Priority</label>
                                <select name="priority" value={formData.priority || 'MEDIUM'} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    {TASK_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>
                        {isEdit && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Status</label>
                                <select name="status" value={formData.status || 'TO_DO'} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    {TASK_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                </select>
                            </div>
                        )}
                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={onCancel} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">Cancel</button>
                            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                                {isEdit ? 'Update Task' : 'Create Task'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

