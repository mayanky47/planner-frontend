import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMarkdown } from '@fortawesome/free-brands-svg-icons';
import { faSave, faSpinner, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

interface MarkdownEditorProps {
    content: string | null | undefined;
    onSave: (markdownContent: string) => Promise<void>;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ content, onSave }) => {
    const [markdownContent, setMarkdownContent] = useState(content || '');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);

    useEffect(() => {
        setMarkdownContent(content || '');
        setHasChanged(false);
        if (isSaving) { // If a save just completed, exit edit mode
            setIsEditing(false);
        }
    }, [content]);

    useEffect(() => {
        setHasChanged(markdownContent !== (content || ''));
    }, [markdownContent, content]);

    const handleSave = async () => {
        if (!hasChanged || isSaving) return;
        setIsSaving(true);
        await onSave(markdownContent);
        setIsSaving(false);
    };

    const handleCancel = () => {
        setMarkdownContent(content || '');
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
                 <h3 className="mb-4 flex items-center gap-x-3 border-b border-slate-200 pb-3 text-2xl font-semibold text-slate-800">
                    <FontAwesomeIcon icon={faMarkdown} className="text-slate-500" />
                    <span>Editing Project Document</span>
                </h3>
                <textarea
                    value={markdownContent}
                    onChange={(e) => setMarkdownContent(e.target.value)}
                    rows={18}
                    placeholder="Start typing your Markdown documentation here... Tables, code blocks, and lists are supported."
                    className="block w-full rounded-lg border-slate-300 p-4 font-mono text-sm shadow-sm resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
                <div className="mt-4 flex items-center justify-end space-x-3">
                     <span className="text-xs text-slate-500">{markdownContent.length} characters</span>
                    <button onClick={handleCancel} disabled={isSaving} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">Cancel</button>
                    <button onClick={handleSave} disabled={!hasChanged || isSaving} className="flex min-w-[140px] items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed">
                        {isSaving ? <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> : <FontAwesomeIcon icon={faSave} className="mr-2" />}
                        {isSaving ? 'Saving...' : 'Save Document'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-md">
            <header className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="flex items-center gap-x-3 text-2xl font-semibold text-slate-800">
                    <FontAwesomeIcon icon={faMarkdown} className="text-slate-500" />
                    <span>Project Document</span>
                </h3>
                <button onClick={() => setIsEditing(true)} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600" title="Edit Document">
                    <FontAwesomeIcon icon={faPencilAlt} className="text-sm" />
                </button>
            </header>
            {/* The `prose` classes from @tailwindcss/typography provide beautiful styling for rendered markdown */}
            <article className="prose prose-slate max-w-none prose-sm sm:prose-base">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdownContent || '*No document content yet. Click the pencil icon to start editing.*'}
                </ReactMarkdown>
            </article>
        </div>
    );
};

