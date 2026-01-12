export default function CreateNoteButton({ onCreate }) {
    return (
        <button onClick={onCreate} className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b">
            + New note
        </button>
    );
}