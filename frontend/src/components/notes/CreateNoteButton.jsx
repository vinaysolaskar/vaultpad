export default function CreateNoteButton({ onCreate }) {
    return (
        <button
            onClick={onCreate}
            className="w-full bg-[#EBEBEB] text-black hover:bg-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
            <span>+</span>
            <span className="text-black">New Note</span> {/* Explicitly set text-black to avoid hover invisibility */}
        </button>
    );
}