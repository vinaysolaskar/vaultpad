export default function EditorFooter({
    isEditing,
    status,
    onToggleEdit,
    onDelete,
}) {
    return (
        <div className="flex justify-between items-center w-full min-w-[280px]  text-sm text-gray-500">
            <span>{isEditing ? status : "Read only"}</span>

            <div className="space-x-4">
                <button onClick={onToggleEdit} className="hover:underline">
                    {isEditing ? "Done" : "Edit"}
                </button>

                <button onClick={onDelete} className="text-red-600 hover:underline">
                    Delete
                </button>
            </div>
        </div>
    )
}