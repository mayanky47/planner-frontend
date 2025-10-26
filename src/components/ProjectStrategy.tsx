import React, { useState, useEffect } from 'react';
import type { Project } from '../types';
// Make sure you have an icon library configured (e.g., via NPM packages)
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faHistory, faSave, faSpinner, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

interface ProjectStrategyProps {
    project: Project;
    onSaveProject: (data: Partial<Project>) => Promise<Project | null>;
    onOpenHistory: () => void;
}

const ProjectStrategy: React.FC<ProjectStrategyProps> = ({ project, onSaveProject, onOpenHistory }) => {
    const [planContent, setPlanContent] = useState<string>(project.strategyPlan || '');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [hasChanged, setHasChanged] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    useEffect(() => {
        setPlanContent(project.strategyPlan || '');
        setHasChanged(false);
        setIsEditing(false);
    }, [project.strategyPlan]);

    useEffect(() => {
        const contentIsDifferent = planContent !== (project.strategyPlan || '');
        setHasChanged(contentIsDifferent);
    }, [planContent, project.strategyPlan]);

    const handleSave = async () => {
        if (!hasChanged || isSaving) return;
        setIsSaving(true);
        try {
            await onSaveProject({ id: project.id, strategyPlan: planContent });
            setIsEditing(false);
        } catch (e) {
            console.error("Manual save failed:", e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setPlanContent(project.strategyPlan || '');
        setHasChanged(false);
        setIsEditing(false);
    };

    // --- JSX with updated Tailwind CSS classes ---
    const renderContentArea = () => {
        if (isEditing) {
            return (
                <>
                    <textarea
                        value={planContent}
                        onChange={(e) => setPlanContent(e.target.value)}
                        rows={15}
                        placeholder="Start typing your high-level goals, milestones, and strategic plan here..."
                        className="block w-full rounded-lg border-slate-300 p-4 font-serif text-lg
                                   shadow-sm resize-none
                                   focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                    />
                    {/* --- NEW: Live character count --- */}
                    <div className="mt-2 text-right text-xs text-slate-500">
                        {planContent.length} characters
                    </div>
                    <div className="mt-4 flex justify-end space-x-3">
                        {/* --- Modern secondary button style --- */}
                        <button
                            onClick={handleCancelEdit}
                            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700
                                       transition hover:bg-slate-200 disabled:opacity-50
                                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                         {/* --- Modern primary button style --- */}
                        <button
                            onClick={handleSave}
                            className={`flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm
                                       transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                                       ${hasChanged && !isSaving
                                           ? 'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-500'
                                           : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                       }`}
                            disabled={!hasChanged || isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </>
            );
        } else {
             // --- Modern read-only view with clearer hover interaction ---
            return (
                <div
                    onClick={() => setIsEditing(true)}
                    className="group relative cursor-pointer rounded-lg border border-slate-200 bg-slate-50/50 p-4
                               min-h-[300px] transition duration-150 hover:ring-2 hover:ring-indigo-300"
                >
                    <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-slate-800">
                        {planContent || (
                            <span className="italic text-slate-400">
                                Click here to define your project plan. This serves as your high-level strategy notebook.
                            </span>
                        )}
                    </div>
                    <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-indigo-500
                                   opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                        <FontAwesomeIcon icon={faPencilAlt} className="text-sm" />
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="mb-4 flex items-start justify-between border-b border-slate-200 pb-3">
                <h3 className="flex items-center space-x-3 text-2xl font-semibold text-slate-800">
                    <FontAwesomeIcon icon={faBookOpen} className="text-indigo-600" />
                    <span>Project Plan Notebook</span>
                </h3>
                {/* --- Modern tertiary/ghost button style --- */}
                <button
                    onClick={onOpenHistory}
                    className="flex items-center space-x-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm
                               font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    disabled={isSaving}
                >
                    <FontAwesomeIcon icon={faHistory} />
                    <span>View Revisions</span>
                </button>
            </div>
            
            <div className="space-y-4">
                {renderContentArea()}
            </div>
        </div>
    );
};

export default ProjectStrategy;
