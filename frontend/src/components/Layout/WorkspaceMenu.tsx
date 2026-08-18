import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, Plus, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../lib/utils';

export function WorkspaceMenu() {
  const workspaces = useAppStore((s) => s.workspaces);
  const currentId = useAppStore((s) => s.currentWorkspaceId);
  const setCurrent = useAppStore((s) => s.setCurrentWorkspace);
  const addWorkspace = useAppStore((s) => s.addWorkspace);

  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = workspaces.find((w) => w.id === currentId) ?? workspaces[0];

  // Close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setAdding(false);
        setNewName('');
      }
    }
    if (open) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  // Focus the input when the add row appears
  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const handleAdd = useCallback(() => {
    const name = newName.trim();
    if (name) {
      addWorkspace(name);
    }
    setNewName('');
    setAdding(false);
  }, [newName, addWorkspace]);

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
    if (e.key === 'Escape') {
      e.stopPropagation();
      setAdding(false);
      setNewName('');
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2 h-8 rounded-md hover:bg-[var(--color-card-hover)] text-sm font-medium text-[var(--color-text)] transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="text-[var(--color-accent)]">{current?.icon}</span>
        <span>{current?.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full left-0 mt-1.5 w-56 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg shadow-xl p-1 z-30 animate-fade-in"
        >
          <div className="px-2 pt-1.5 pb-1 text-2xs uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Workspaces
          </div>

          {workspaces.map((w) => (
            <button
              key={w.id}
              role="menuitem"
              onClick={() => {
                setCurrent(w.id);
                setOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-2 px-2 h-8 rounded-md text-sm transition-colors',
                w.id === currentId
                  ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text)] hover:bg-[var(--color-card-hover)]',
              )}
            >
              <span className="text-[var(--color-accent)]">{w.icon}</span>
              <span className="flex-1 text-left">{w.name}</span>
              {w.id === currentId && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}

          <div className="my-1 border-t border-[var(--color-border)]" />

          {adding ? (
            /* Inline new-workspace input */
            <div className="flex items-center gap-1 px-2 py-1">
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Workspace name…"
                maxLength={32}
                className="flex-1 h-7 px-2 rounded-md bg-[var(--color-card)] border border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] transition-colors"
                aria-label="New workspace name"
              />
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="h-7 px-2 rounded-md bg-[var(--color-accent)] text-white text-xs font-medium disabled:opacity-40 hover:bg-[var(--color-accent-hover)] transition-colors"
                aria-label="Confirm new workspace"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { setAdding(false); setNewName(''); }}
                className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-[var(--color-card-hover)] text-[var(--color-text-secondary)] transition-colors"
                aria-label="Cancel"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              role="menuitem"
              onClick={() => setAdding(true)}
              className="w-full flex items-center gap-2 px-2 h-8 rounded-md text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-text)] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New workspace
            </button>
          )}
        </div>
      )}
    </div>
  );
}
