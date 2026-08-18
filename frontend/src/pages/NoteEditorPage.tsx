import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useNoteStore } from '../store/noteStore';
import { IconButton } from '../components/ui/IconButton';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatRelativeTime } from '../lib/utils';

// ── Lightweight markdown renderer (no external dependency) ───────────────
function renderMarkdown(raw: string): string {
  let html = raw
    // Escape HTML entities first to prevent XSS
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Fenced code blocks (``` ... ```)
  html = html.replace(/```([\w-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const cls = lang ? ` class="language-${lang}"` : '';
    return `<pre><code${cls}>${code.trimEnd()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  // Headings
  html = html.replace(/^#{4} (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^#{3} (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#{2} (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr>');

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote><p>$1</p></blockquote>');

  // Unordered lists
  html = html.replace(/((?:^[-*] .+\n?)+)/gm, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map((l) => `<li>${l.replace(/^[-*] /, '')}</li>`)
      .join('');
    return `<ul>${items}</ul>`;
  });

  // Ordered lists
  html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
    const items = block
      .trim()
      .split('\n')
      .map((l) => `<li>${l.replace(/^\d+\. /, '')}</li>`)
      .join('');
    return `<ol>${items}</ol>`;
  });

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Wiki-links [[Note Title]]
  html = html.replace(/\[\[([^\]]+)\]\]/g, '<span class="wiki-link">$1</span>');

  // Inline tags #tag
  html = html.replace(/(^|\s)#([\w-]+)/g, '$1<span class="wiki-link">#$2</span>');

  // Paragraphs — wrap lines not already inside a block element
  html = html
    .split('\n')
    .map((line) => {
      if (
        line.startsWith('<h') ||
        line.startsWith('<ul') ||
        line.startsWith('<ol') ||
        line.startsWith('<li') ||
        line.startsWith('<blockquote') ||
        line.startsWith('<pre') ||
        line.startsWith('<hr') ||
        line.trim() === ''
      ) {
        return line;
      }
      return `<p>${line}</p>`;
    })
    .join('\n');

  return html;
}

export function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const notes = useNoteStore((s) => s.notes);
  const updateNote = useNoteStore((s) => s.updateNote);
  const toggleFavorite = useNoteStore((s) => s.toggleFavorite);
  const deleteNote = useNoteStore((s) => s.deleteNote);
  const createNote = useNoteStore((s) => s.createNote);

  const note = notes.find((n) => n.id === id);

  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);

  // Link suggestions state
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);

  const filteredNotes = useMemo(() => {
    if (!suggestionQuery) return notes.filter(n => n.id !== note?.id).slice(0, 5);
    return notes
      .filter(n => n.id !== note?.id && n.title.toLowerCase().includes(suggestionQuery.toLowerCase()))
      .slice(0, 5);
  }, [notes, suggestionQuery, note?.id]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    
    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const match = textBeforeCursor.match(/\[\[([^\]]*)$/);
    if (match) {
      setShowSuggestions(true);
      setSuggestionQuery(match[1]);
      setCursorPos(cursor);
      setSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertLink = (linkedTitle: string) => {
    const textBefore = content.slice(0, cursorPos);
    const textAfter = content.slice(cursorPos);
    
    const lastBracketIndex = textBefore.lastIndexOf('[[');
    if (lastBracketIndex !== -1) {
      const newBefore = textBefore.slice(0, lastBracketIndex) + `[[${linkedTitle}]]`;
      setContent(newBefore + textAfter);
    }
    setShowSuggestions(false);
    
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && filteredNotes.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionIndex(i => (i + 1) % filteredNotes.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionIndex(i => (i - 1 + filteredNotes.length) % filteredNotes.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        insertLink(filteredNotes[suggestionIndex].title);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  const handlePreviewClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('wiki-link')) {
      const linkText = target.innerText;
      if (linkText.startsWith('#')) return; // ignore tags
      
      const linkedNote = notes.find((n) => n.title.toLowerCase() === linkText.toLowerCase());
      if (linkedNote) {
        navigate(`/notes/${linkedNote.id}`);
      } else {
        if (window.confirm(`Note "${linkText}" doesn't exist. Create it?`)) {
          const newId = await createNote();
          await updateNote(newId, { title: linkText });
          navigate(`/notes/${newId}`);
        }
      }
    }
  };

  // Sync local state when the note changes (e.g. navigating between notes)
  useEffect(() => {
    setTitle(note?.title ?? '');
    setContent(note?.content ?? '');
  }, [id, note?.title, note?.content]);

  // Autosave with 500 ms debounce
  useEffect(() => {
    if (!note || !id) return;
    const t = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        updateNote(id, { title, content });
        setSavedAt(Date.now());
      }
    }, 500);
    return () => clearTimeout(t);
  }, [title, content, id, note, updateNote]);

  // Reset "Saved" indicator after 2 s
  useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(null), 2000);
    return () => clearTimeout(t);
  }, [savedAt]);

  const renderedHtml = useMemo(() => renderMarkdown(content), [content]);

  if (!note) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <h1 className="text-xl font-semibold mb-2">Note not found</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          This note may have been deleted or never existed.
        </p>
        <Button variant="primary" onClick={() => navigate('/notes')}>
          Back to all notes
        </Button>
      </div>
    );
  }

  function handleDelete() {
    if (!id) return;
    if (window.confirm(`Delete "${note!.title}"? This cannot be undone.`)) {
      deleteNote(id);
      navigate('/notes');
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 gap-2">
        <Link
          to="/notes"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All notes
        </Link>
        <div className="flex items-center gap-1">
          {/* Saved indicator — fades in, auto-clears after 2s */}
          <span
            className={`text-2xs text-[var(--color-text-tertiary)] mr-2 flex items-center gap-1 transition-opacity duration-300 ${
              savedAt ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-live="polite"
          >
            <Save className="h-3 w-3" />
            Saved
          </span>

          {/* Preview toggle */}
          <IconButton
            size="sm"
            label={preview ? 'Switch to edit mode' : 'Switch to preview mode'}
            onClick={() => setPreview((v) => !v)}
          >
            {preview ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </IconButton>

          <IconButton
            size="sm"
            label={note.favorite ? 'Unfavorite' : 'Favorite'}
            onClick={() => toggleFavorite(note.id)}
          >
            <Star
              className={`h-4 w-4 ${
                note.favorite
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            />
          </IconButton>
          <IconButton size="sm" label="Delete" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled"
        readOnly={preview}
        className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-[var(--color-text-tertiary)] mb-3 disabled:cursor-default"
        aria-label="Note title"
      />

      {/* Meta */}
      <div className="flex items-center gap-2 mb-6 text-xs text-[var(--color-text-secondary)] flex-wrap">
        <Badge variant="default">{note.folder}</Badge>
        {note.tags.map((t) => (
          <Badge key={t} variant="accent">#{t}</Badge>
        ))}
        <span className="text-[var(--color-text-tertiary)]">
          · Updated {formatRelativeTime(note.updatedAt)}
        </span>
        <span className="text-[var(--color-text-tertiary)]">
          · {note.wordCount} words
        </span>
      </div>

      {/* Editor / Preview */}
      <div className="relative">
        {preview ? (
          <div
            className="prose-note min-h-[60vh] cursor-text"
            onClick={handlePreviewClick}
            // renderMarkdown only inserts safe content — no user-supplied HTML
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        ) : (
          <>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Start writing…"
              className="w-full min-h-[60vh] bg-transparent outline-none text-[15px] leading-relaxed text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)] resize-none font-mono"
              aria-label="Note content"
            />
            {/* Auto-suggest dropdown for linking */}
            {showSuggestions && (
              <div className="absolute z-50 mt-1 w-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl top-1/4 left-1/4">
                <div className="px-3 py-2 border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)]">
                  Link to note...
                </div>
                {filteredNotes.length === 0 ? (
                  <div className="px-3 py-4 text-sm text-[var(--color-text-tertiary)] italic">
                    No matching notes. Press Enter to create "{suggestionQuery}".
                  </div>
                ) : (
                  <ul className="max-h-60 overflow-y-auto p-1">
                    {filteredNotes.map((n, i) => (
                      <li
                        key={n.id}
                        onClick={() => insertLink(n.title)}
                        onMouseEnter={() => setSuggestionIndex(i)}
                        className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                          i === suggestionIndex
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'text-[var(--color-text)] hover:bg-[var(--color-card-hover)]'
                        }`}
                      >
                        {n.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-[var(--color-border)] text-2xs text-[var(--color-text-tertiary)] flex items-center justify-between">
        <span>{preview ? 'Preview mode — click the eye icon to edit' : 'Markdown supported · [[wiki-links]] · #tags'}</span>
        <span>{note.wordCount} words</span>
      </div>
    </div>
  );
}
