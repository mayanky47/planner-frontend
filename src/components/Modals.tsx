import React, { useState, useEffect } from 'react';
import type { Task, TaskVersionHistory, Project, ProjectStrategyVersion } from '../types';
import { API_BASE_URL, makeApiCall } from '../utils/UtilsAndHooks';
import { HistoryModalLayout, TimelineItem } from './HistoryModalLayout'; // Import the new components

// --- Task History Modal ---

interface TaskHistoryModalProps {
    taskId: number;
    taskTitle: string;
    onClose: () => void;
}

export const TaskHistoryModal: React.FC<TaskHistoryModalProps> = ({ taskId, taskTitle, onClose }) => {
    const [history, setHistory] = useState<TaskVersionHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const data = await makeApiCall(`${API_BASE_URL}/tasks/${taskId}/history`, { method: 'GET' });
                setHistory(data || []);
            } catch (err) {
                setError('Failed to load history.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [taskId]);

    return (
        <HistoryModalLayout title={`History for: ${taskTitle}`} onClose={onClose} isLoading={isLoading} error={error}>
            {history.length > 0 ? (
                <div className="space-y-6">
                    {history.map((item, index) => (
                        <TimelineItem key={item.id} isLast={index === history.length - 1}>
                            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                                <p className="text-sm font-semibold text-slate-800">{item.changeSummary}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {new Date(item.versionTimestamp).toLocaleString()}
                                </p>
                            </div>
                        </TimelineItem>
                    ))}
                </div>
            ) : (
                <p className="italic text-slate-500">No historical versions found for this task.</p>
            )}
        </HistoryModalLayout>
    );
};


// --- Project Strategy History Modal ---

interface ProjectStrategyHistoryModalProps {
    project: Project;
    onClose: () => void;
}

export const ProjectStrategyHistoryModal: React.FC<ProjectStrategyHistoryModalProps> = ({ project, onClose }) => {
    const [history, setHistory] = useState<ProjectStrategyVersion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const data = await makeApiCall(`${API_BASE_URL}/projects/${project.id}/strategy-history`, { method: 'GET' });
                // Backend now sorts descending, so no reverse is needed.
                setHistory(data || []);
            } catch (err) {
                setError('Failed to load strategy history.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [project.id]);

    return (
        <HistoryModalLayout
            title={`Strategy History: ${project.name}`}
            onClose={onClose}
            isLoading={isLoading}
            error={error}
            maxWidth="max-w-4xl"
        >
            {/* Display Current Plan First */}
            <div className="mb-8 rounded-xl border-l-4 border-indigo-500 bg-slate-50 p-4 shadow-sm">
                <h4 className="mb-2 text-lg font-bold text-slate-800">Current Active Plan</h4>
                <p className="whitespace-pre-wrap text-sm text-slate-600">
                    {project.strategyPlan || 'No Active Plan Defined'}
                </p>
            </div>
            
            {/* Display Revisions */}
            <h3 className="mb-6 text-xl font-semibold text-slate-700">Plan Revisions ({history.length})</h3>
            {history.length > 0 ? (
                <div className="space-y-6">
                    {history.map((item, index) => (
                        <TimelineItem key={item.versionId} isLast={index === history.length - 1}>
                            <div className="rounded-lg border border-slate-200 bg-white p-4">
                                <div className="mb-2 flex items-center justify-between border-b pb-2 text-xs">
                                    <span className="font-semibold text-slate-600">Revision #{history.length - index}</span>
                                    <span className="font-medium text-slate-500">{new Date(item.versionTimestamp).toLocaleString()}</span>
                                </div>
                                <details className="text-sm">
                                    <summary className="cursor-pointer font-semibold text-indigo-600 hover:text-indigo-800">
                                        View State from this Revision
                                    </summary>
                                    <div className="mt-3 whitespace-pre-wrap rounded-md border bg-slate-50 p-3 text-xs text-slate-700">
                                        {item.oldStrategyPlan || 'N/A'}
                                    </div>
                                </details>
                            </div>
                        </TimelineItem>
                    ))}
                </div>      
            ) : (
                <p className="italic text-slate-500">No historical versions found.</p>
            )}
        </HistoryModalLayout>
    );
};