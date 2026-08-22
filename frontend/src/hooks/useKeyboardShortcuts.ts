import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useCreateNote } from './useNotes';

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const toggleSearch = useAppStore((s) => s.toggleSearch);
  const toggleLeftSidebar = useAppStore((s) => s.toggleLeftSidebar);
  const createNote = useCreateNote();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSearch();
        return;
      }

      if (mod && e.key.toLowerCase() === 'b' && !isTypingTarget(e.target)) {
        e.preventDefault();
        toggleLeftSidebar();
        return;
      }

      if (mod && e.key.toLowerCase() === 'n' && !isTypingTarget(e.target)) {
        e.preventDefault();
        createNote.mutateAsync({ title: 'Untitled', content: '', folder: 'Inbox' }).then((note) => {
          navigate(`/notes/${note.id}`);
        });
        return;
      }

      if (e.key === 'Escape') {
        const { searchOpen, setSearchOpen } = useAppStore.getState();
        if (searchOpen) setSearchOpen(false);
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleSearch, toggleLeftSidebar, createNote, navigate]);
}
