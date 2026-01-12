import { format } from "date-fns";
import EditorFooter from "../EditorFooter";
import { useNoteEditor } from "../../hooks/useNoteEditor";
import { useEffect } from "react"

export default function NoteEditor({ noteId, onDelete, onNoteUpdate, noteData }) {
    const { title, setTitle, content, setContent, isEditing, setIsEditing, status, loading } = useNoteEditor(noteId, onNoteUpdate);

    useEffect(() => {
        if (noteData) {
            setTitle(noteData.title || "");
            setContent(noteData.content || "");
        }
    }, [noteData, setTitle, setContent]);

    if (!noteId) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#202020]">
                <div className="text-center">
                    <div className="text-4xl mb-4 opacity-20">📂</div>
                    <p className="text-gray-500 italic">Select a note from the sidebar to start writing</p>
                </div>
            </div>
        );
    }

    // Keep the loading check for the initial fetch
    if (loading && !title) return <div className="flex-1 flex items-center justify-center text-gray-500 bg-[#202020]">Syncing...</div>;

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-4 md:px-12">
            {/* Page Metadata Header */}
            <div className="py-8 border-b border-[#2F2F2F] mb-8 flex flex-wrap gap-6 items-center">
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</span>
                    <span className="text-xs text-blue-400 font-bold uppercase tracking-tighter">{status || "Synced"}</span>
                </div>
                {noteData?.created_at && (
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Created</span>
                        <span className="text-xs text-gray-300">{format(new Date(noteData.created_at), 'MMMM d, yyyy')}</span>
                    </div>
                )}
                {noteData?.updated_at && (
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Last Modified</span>
                        <span className="text-xs text-gray-300">{format(new Date(noteData.updated_at), 'MMMM d, h:mm a')}</span>
                    </div>
                )}
            </div>

            {/* Notion Style Editor */}
            <div className="flex-1 flex flex-col pb-40">
                <input
                    // FALLBACK: Use noteData.title if local state hasn't updated yet
                    value={title || (loading ? "" : noteData?.title) || ""}
                    disabled={!isEditing}
                    maxLength={30}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Untitled"
                    className="text-4xl font-bold bg-transparent outline-none placeholder:text-[#373737] mb-6"
                />
                <textarea
                    value={content || (loading ? "" : noteData?.content) || ""}
                    readOnly={!isEditing}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 bg-transparent outline-none resize-none text-lg leading-relaxed placeholder:text-[#373737]"
                    placeholder="Type '/' for commands..."
                />
            </div>

            {/* Floating Action Bar */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
                <div className="bg-[#262626] border border-[#3F3F3F] rounded-full px-8 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center min-w-[320px]">
                    <EditorFooter
                        isEditing={isEditing}
                        status={status}
                        onToggleEdit={() => setIsEditing(v => !v)}
                        onDelete={() => onDelete(noteId)}
                    />
                </div>
            </div>
        </div>
    );
}