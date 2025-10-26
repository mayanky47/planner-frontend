import React, { useState, useMemo } from 'react';
import type { Project } from './types';
import { useProjects } from './utils/UtilsAndHooks';
import ProjectDashboard from './components/ProjectDashboard';
import ProjectDetailView from './views/ProjectDetailView';
import { ProjectForm } from './components/Forms';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';

const App: React.FC = () => {
    const { projects, isLoading, error, saveProject, deleteProject, fetchProjects } = useProjects();
    
    const [currentView, setCurrentView] = useState<'DASHBOARD' | 'DETAIL'>('DASHBOARD');
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    
    const [showProjectForm, setShowProjectForm] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Partial<Project> | null>(null);

    const handleSelectProject = (id: number) => {
        setSelectedProjectId(id);
        setCurrentView('DETAIL');
    };

    const handleBackToDashboard = () => {
        setSelectedProjectId(null);
        setCurrentView('DASHBOARD');
    };
    
    const handleEditProject = (project: Partial<Project>) => {
        setProjectToEdit(project);
        setShowProjectForm(true);
    };

    const handleNewProject = () => {
        setProjectToEdit({});
        setShowProjectForm(true);
    };

    const handleSaveProjectForm = async (data: Partial<Project>) => {
        console.log("Saving project data:", data);
        await saveProject(data);
        setShowProjectForm(false);
        setProjectToEdit(null);
        
        // --- FIX: Re-fetch all projects from the server ---
        // This is crucial to get the updated childProjects array on the parent object.
        await fetchProjects();
    };

    // --- NEW: Find the full project object from the master list ---
    const selectedProject = useMemo(() =>
        projects.find(p => p.id === selectedProjectId)
    , [projects, selectedProjectId]);


    const renderContent = () => {
        if (isLoading && projects.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center pt-20 text-xl text-slate-500">
                    <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mb-4" />
                    Loading projects...
                </div>
            );
        }

        if (error) {
            return <div className="m-6 rounded-lg bg-red-100 p-4 text-center text-red-700">{error}</div>;
        }

        // --- FIX: Pass the full project object, not just the ID ---
        if (currentView === 'DETAIL' && selectedProject) {
            return (
                <ProjectDetailView
                    project={selectedProject} // Pass the full object
                    onBack={handleBackToDashboard}
                    onSelectProject={handleSelectProject}
                    onEditProject={handleEditProject}
                    onDeleteProject={deleteProject}
                />
            );
        }

        return (
            <ProjectDashboard
                projects={projects}
                onSelectProject={handleSelectProject}
                onEditProject={handleEditProject}
                onDeleteProject={deleteProject}
                onNewProject={handleNewProject}
            />
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="sticky top-0 z-10 bg-white/80 shadow-sm backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                        Project Planner
                    </h1>
                    {currentView === 'DASHBOARD' && (
                        <button
                            onClick={handleNewProject}
                            className="flex items-center gap-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            New Project
                        </button>
                    )}
                </div>
            </header>

            <main className="mx-auto max-w-7xl pb-12">
                {renderContent()}
            </main>
            
            {showProjectForm && (
                <ProjectForm
                    project={projectToEdit}
                    onSave={handleSaveProjectForm}
                    onCancel={() => {
                        setShowProjectForm(false);
                        setProjectToEdit(null);
                    }}
                />
            )}
        </div>
    );
};

export default App;

