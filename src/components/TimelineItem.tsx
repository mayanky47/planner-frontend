import React from 'react';

/**
 * Props for the TimelineItem component.
 * @property {React.ReactNode} children - The content to display within the timeline entry.
 * @property {boolean} [isLast=false] - Indicates if this is the last item in the timeline to prevent drawing a line below it.
 */
interface TimelineItemProps {
    children: React.ReactNode;
    isLast?: boolean;
}

/**
 * A component that renders a single item in a vertical timeline,
 * complete with a decorative dot and a connecting line.
 */
export const TimelineItem: React.FC<TimelineItemProps> = ({ isLast = false, children }) => {
    return (
        <div className="relative flex items-start">
            {/* This container holds the dot and the vertical line */}
            <div className="flex-shrink-0">
                {/* The colored dot */}
                <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 shadow-sm">
                    {/* A smaller inner dot for a refined look */}
                    <div className="h-2 w-2 rounded-full bg-white" />
                </div>
                {/* The connecting vertical line, which is omitted for the last item */}
                {!isLast && (
                    <div className="mx-auto mt-1 h-full w-0.5 bg-slate-200" style={{ minHeight: '2rem' }} />
                )}
            </div>

            {/* The main content for the timeline entry */}
            <div className="ml-4 w-full pb-6">
                {children}
            </div>
        </div>
    );
};