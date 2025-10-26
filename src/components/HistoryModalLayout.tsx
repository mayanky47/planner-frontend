import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCircleNotch } from '@fortawesome/free-solid-svg-icons';

// Reusable Layout for any history modal
interface HistoryModalLayoutProps {
    title: string;
    onClose: () => void;
    isLoading: boolean;
    error: string | null;
    children: React.ReactNode;
    maxWidth?: string;
}

export const HistoryModalLayout: React.FC<HistoryModalLayoutProps> = ({
    title, onClose, isLoading, error, children, maxWidth = 'max-w-3xl'
}) => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/70 p-4 pt-10 backdrop-blur-sm"
            aria-modal="true"
            role="dialog"
        >
            <div className={`w-full ${maxWidth} m-4 flex h-[85vh] transform flex-col rounded-xl bg-white shadow-2xl transition-all`}>
                {/* Header */}
                <header className="flex shrink-0 items-center justify-between border-b border-slate-200 p-6">
                    <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </header>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex h-full flex-col items-center justify-center text-slate-500">
                            <FontAwesomeIcon icon={faCircleNotch} spin size="2x" />
                            <p className="mt-4">Loading history...</p>
                        </div>
                    ) : error ? (
                        <div className="rounded-lg bg-red-100 p-4 text-sm text-red-800">{error}</div>
                    ) : (
                        children
                    )}
                </div>
            </div>
        </div>
    );
};

// Reusable Timeline Item for displaying history entries
interface TimelineItemProps {
    isLast?: boolean;
    children: React.ReactNode;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ isLast = false, children }) => {
    return (
        <div className="relative flex items-start">
            {/* Timeline graphics: dot and line */}
            <div className="absolute left-3 top-3 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true">
                {!isLast && <div className="h-full w-full bg-slate-200" />}
            </div>
            <div className="relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-white" />
            </div>
            {/* Content */}
            <div className="ml-4 w-full">{children}</div>
        </div>
    );
};