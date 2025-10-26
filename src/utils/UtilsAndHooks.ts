import { useState, useCallback, useEffect } from 'react';

// --- Global Constants ---
export const TASK_STATUSES = ['TO_DO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
export const API_BASE_URL = 'http://localhost:9010/api';

/**
 * --- Type Definitions (JSDoc representation of TypeScript interfaces) ---
 * * @typedef {object} Project
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {string} status
 * @property {string} goal - New strategy field
 * @property {string} strategyPlan - New strategy field
 * * @typedef {object} Task
 * @property {number} id
 * @property {string} title
 * @property {string} status
 * @property {string} priority
 * * @typedef {object} ProjectStrategyVersion
 * @property {number} versionId
 * @property {string} oldGoal
 * @property {string} oldStrategyPlan
 * */

// --- Utility Functions ---

/**
 * Executes a fetch request with exponential backoff for resilience.
 */
export const makeApiCall = async (url, options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            if (response.status === 204 || response.headers.get('content-length') === '0') {
                return null;
            }
            return await response.json();
        } catch (error) {
            if (i < retries - 1) {
                const delay = Math.pow(2, i) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error(`API Call failed after ${retries} attempts:`, error);
                throw error;
            }
        }
    }
};

/**
 * Helper to get Tailwind color classes based on priority.
 * @param {Task['priority']} priority
 */
export const getPriorityClasses = (priority) => {
    switch (priority) {
        case 'HIGH':
            return 'bg-red-500 text-white';
        case 'MEDIUM':
            return 'bg-yellow-400 text-gray-800';
        case 'LOW':
        default:
            return 'bg-green-500 text-white';
    }
};

// --- Custom Hooks ---

/**
 * Handles fetching, creating, and managing the list of Projects.
 */
export const useProjects = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProjects = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await makeApiCall(`${API_BASE_URL}/projects`, { method: 'GET' });
            setProjects(data || []);
        } catch (err) {
            setError('Failed to load projects.');
            setProjects([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const saveProject = async (projectData) => {
        const isUpdate = !!projectData.id;
        const url = isUpdate ? `${API_BASE_URL}/projects/${projectData.id}` : `${API_BASE_URL}/projects`;
        const method = isUpdate ? 'PUT' : 'POST';

        try {
            const savedProject = await makeApiCall(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData),
            });

            if (savedProject) {
                setProjects(prev => {
                    if (isUpdate) {
                        return prev.map(p => p.id === savedProject.id ? savedProject : p);
                    } else {
                        return [savedProject, ...prev];
                    }
                });
                return savedProject;
            }
            return null;
        } catch (err) {
            setError(`Failed to save project: ${isUpdate ? 'update' : 'create'} failed.`);
            return null;
        }
    };

    const deleteProject = async (id) => {
        try {
            await makeApiCall(`${API_BASE_URL}/projects/${id}`, { method: 'DELETE' });
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            setError('Failed to delete project.');
        }
    };

    return { projects, isLoading, error, saveProject, deleteProject, fetchProjects };
};
