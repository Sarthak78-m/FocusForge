import { useNavigate } from 'react-router-dom';
import { Plus, Timer, CheckSquare, GitBranch, MessageSquare } from 'lucide-react';
import { useNoteStore } from '../../store/noteStore';

export function QuickActions() {
  const navigate = useNavigate();
  const createNote = useNoteStore((s) => s.createNote);

  async function handleNew() {
    const id = await createNote();
    navigate(`/notes/${id}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={handleNew}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
      >
        <Plus className="h-4 w-4" />
        New Note
      </button>

      <button
        onClick={() => navigate('/focus')}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
      >
        <Timer className="h-4 w-4" />
        Focus Timer
      </button>

      <button
        onClick={() => navigate('/tasks')}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-sm"
      >
        <CheckSquare className="h-4 w-4" />
        Tasks
      </button>

      <button
        onClick={() => navigate('/chat')}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-sm"
      >
        <MessageSquare className="h-4 w-4" />
        Study Chat
      </button>

      <button
        onClick={() => navigate('/graph')}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-[var(--color-text)] bg-[var(--color-card)] border border-[var(--color-border)] hover:bg-[var(--color-card-hover)] transition-colors shadow-sm"
      >
        <GitBranch className="h-4 w-4 text-[var(--color-text-secondary)]" />
        Graph View
      </button>
    </div>
  );
}

