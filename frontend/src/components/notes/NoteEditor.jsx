import { format } from "date-fns";
import EditorFooter from "../EditorFooter";
import { useNoteEditor } from "../../hooks/useNoteEditor";
import { useEffect, useRef } from "react";

export default function NoteEditor({ noteId, onDelete, onNoteUpdate, noteData }) {
    const {
        title, setTitle,
        content, setContent,
        isEditing, setIsEditing,
        status, loading
    } = useNoteEditor(noteId, onNoteUpdate);

    const prevNoteId = useRef(noteId);

    useEffect(() => {
        // Sync state when switching notes
        if (prevNoteId.current !== noteId) {
            setTitle(noteData?.title || "");
            setContent(noteData?.content || "");
            prevNoteId.current = noteId;
            return;
        }

        // Initial load sync
        if (noteData && !title && !content) {
            setTitle(noteData.title || "");
            setContent(noteData.content || "");
        }
    }, [noteId, noteData, setTitle, setContent]);

    if (!noteId) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#202020]">
                <div className="text-center animate-in fade-in zoom-in duration-300">
                    <div className="text-4xl mb-4 opacity-20">📂</div>
                    <p className="text-gray-500 italic">Select a note to start writing</p>
                </div>
            </div>
        );
    }

    if (loading && !title) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#202020]">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-4 md:px-12 animate-in fade-in duration-500">
            {/* Metadata Header */}
            <div className="py-8 border-b border-[#2F2F2F] mb-8 flex flex-wrap gap-6 items-center">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</span>
                    <span className={`text-xs font-bold uppercase transition-colors duration-300 ${status === 'Saving...' ? 'text-yellow-500' : 'text-blue-400'
                        }`}>
                        {status || "Synced"}
                    </span>
                </div>
                {noteData?.updated_at && (
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Last Modified</span>
                        <span className="text-xs text-gray-400">
                            {format(new Date(noteData.updated_at), 'MMM d, h:mm a')}
                        </span>
                    </div>
                )}
            </div>

            {/* Editor Input Area */}
            <div className="flex-1 flex flex-col pb-40">
                <input
                    value={title}
                    disabled={!isEditing}
                    maxLength={50}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Untitled"
                    className="text-4xl font-bold bg-transparent outline-none placeholder:text-[#373737] mb-6 text-[#EBEBEB] w-full border-none focus:ring-0"
                />
                <textarea
                    value={content}
                    readOnly={!isEditing}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 bg-transparent outline-none resize-none text-lg leading-relaxed placeholder:text-[#373737] text-[#D1D1D1] w-full border-none focus:ring-0"
                    placeholder="Start typing..."
                />
            </div>

            {/* Floating Action Bar */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
                <div className="bg-[#262626]/90 backdrop-blur-sm border border-[#3F3F3F] rounded-full px-8 py-3 shadow-2xl flex items-center min-w-[320px]">
                    <EditorFooter
                        isEditing={isEditing}
                        status={status}
                        onToggleEdit={() => setIsEditing(prev => !prev)}
                        onDelete={() => onDelete(noteId)}
                    />
                </div>
            </div>
        </div>
    );
}