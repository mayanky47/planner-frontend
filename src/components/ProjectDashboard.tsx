import React, { useMemo, useState } from 'react';
import type { Project } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faEdit, faTrash, faFolderOpen, faSitemap } from '@fortawesome/free-solid-svg-icons';

// --- Project Card Component (Modernized & Integrated) ---

interface ProjectCardProps {
    project: Project;
    onSelectProject: (id: number) => void;
    onEditProject: (project: Project) => void;
    onDeleteProject: (id: number) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelectProject, onEditProject, onDeleteProject }) => {
    // Helper for status styling with a softer, more modern palette
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
        <div
            onClick={() => onSelectProject(project.id)}
            className="group flex cursor-pointer flex-col rounded-xl border border-slate-200 bg-white
                       shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
        >
            {/* Card Header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-4">
                <h3 className="text-lg font-bold text-slate-800">{project.name}</h3>
                <span className={`ml-3 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusClasses(project.status)}`}>
                    {(project.status?.replace('_', ' ') ?? 'NO STATUS')}
                </span>
            </div>

            {/* Card Body */}
            <div className="flex flex-grow flex-col p-4">
                <p className="mb-4 flex-grow text-sm text-slate-600 line-clamp-3">{project.description}</p>
                
                {/* Child project count */}
                {project.childProjects && project.childProjects.length > 0 && (
                    <div className="mb-3 flex items-center text-xs text-slate-500">
                        <FontAwesomeIcon icon={faSitemap} className="mr-2 text-slate-400" />
                        {project.childProjects.length} sub-project(s)
                    </div>
                )}
                
                {/* Card Metadata */}
                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-slate-400" />
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                    {project.strategyPlan && (
                        <p className="truncate italic" title={project.strategyPlan}>
                            <span className="font-semibold">Plan:</span> {project.strategyPlan}
                        </p>
                    )}
                </div>
            </div>

            {/* Card Actions Footer */}
            <div className="mt-auto flex justify-end space-x-1 border-t border-slate-100 p-2">
                <button
                    onClick={(e) => handleActionClick(e, () => onEditProject(project))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    title="Edit Project Details"
                >
                    <FontAwesomeIcon icon={faEdit} />
                </button>
                <button
                    onClick={(e) => handleActionClick(e, () => { if (window.confirm(`Delete project '${project.name}'?`)) onDeleteProject(project.id) })}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    title="Delete Project"
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </div>
        </div>
    );
};


// --- Project Dashboard Component (Updated) ---

interface ProjectDashboardProps {
    projects: Project[];
    onSelectProject: (id: number) => void;
    onEditProject: (project: Project) => void;
    onDeleteProject: (id: number) => void;
    onNewProject: () => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projects, onSelectProject, onEditProject, onDeleteProject, onNewProject }) => {

    // --- State for search filter ---
    const [searchTerm, setSearchTerm] = useState('');

    // --- Filter projects by top-level AND search term ---
    const filteredTopLevelProjects = useMemo(() =>
        projects.filter(p =>
            !p.parentProjectId &&
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    , [projects, searchTerm]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <header className="mb-8 flex flex-col gap-y-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
                <h1 className="text-3xl font-bold text-slate-800">Project Dashboard</h1>
                <div className="flex items-center gap-x-2">
                    {/* --- Search Input --- */}
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <button
                        onClick={onNewProject}
                        className="flex flex-shrink-0 items-center gap-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                        New Project
                    </button>
                </div>
            </header>
            
            {filteredTopLevelProjects.length === 0 ? (
                <div className="mt-16 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-200">
                         <FontAwesomeIcon icon={faFolderOpen} className="text-4xl text-slate-400" />
                    </div>
                    <h2 className="mt-6 text-xl font-semibold text-slate-700">
                        {searchTerm ? 'No Projects Found' : 'No Projects Yet'}
                    </h2>
                    <p className="mt-2 text-slate-500">
                        {searchTerm ? `Your search for "${searchTerm}" did not match any projects.` : 'Click "New Project" to get started.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredTopLevelProjects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onSelectProject={onSelectProject}
                            onEditProject={onEditProject}
                            onDeleteProject={onDeleteProject}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectDashboard;

